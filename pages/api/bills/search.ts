import prisma from "lib/prisma";
import { BillType } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { BillList, searchBillListArgsScheme } from "services/bill/scheme";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse";
import { isEmpty } from "lodash-es";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BillList>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const {
    pageIndex,
    pageSize,
    categoryIds,
    type,
    startTime,
    endTime,
    orderBy,
  } = await searchBillListArgsScheme.validate(req.body);

  const where = {
    categoryId: {
      in: !isEmpty(categoryIds) ? categoryIds : undefined,
    },
    type,
    time: {
      gte: startTime,
      lte: endTime,
    },
  };

  if (!(await prisma.bill.count())) await initTable();

  let list: BillList["list"];
  let pageCount: BillList["pageCount"];
  let totalExpenses: BillList["totalExpenses"];
  let totalRevenue: BillList["totalRevenue"];

  await Promise.all([
    prisma.bill
      .findMany({
        skip: pageIndex * pageSize,
        take: pageSize,
        where,
        orderBy: Object.entries(orderBy || {})
          .filter(([, val]) => !!val)
          .map(([key, val]) => ({
            [key]: val,
          })),
      })
      .then((data) => (list = data)),
    prisma.bill
      .count({ where })
      .then((count) => (pageCount = Math.ceil(count / pageSize))),
    prisma.bill
      .aggregate({
        where: {
          categoryId: {
            in: !isEmpty(categoryIds) ? categoryIds : undefined,
          },
          time: {
            gte: startTime,
            lte: endTime,
          },
          type: "EXPENDITURE",
        },
        _sum: {
          amount: true,
        },
      })
      .then((data) => (totalExpenses = data._sum.amount)),
    prisma.bill
      .aggregate({
        where: {
          categoryId: {
            in: !isEmpty(categoryIds) ? categoryIds : undefined,
          },
          time: {
            gte: startTime,
            lte: endTime,
          },
          type: "REVENUE",
        },
        _sum: {
          amount: true,
        },
      })
      .then((data) => (totalRevenue = data._sum.amount)),
  ]);

  res.status(200).json({
    list: list!,
    pageCount: pageCount!,
    totalExpenses: totalExpenses!,
    totalRevenue: totalRevenue!,
  });
}

// 初始化表
async function initTable() {
  const rawBills = await new Promise<
    {
      amount: string;
      category: string;
      time: string;
      type: string;
    }[]
  >((resolve, reject) => {
    const parser = parse({ columns: true }, function (err, records) {
      if (err) reject(err);
      resolve(records);
    });
    fs.createReadStream(path.join(process.cwd(), "public/bill.csv")).pipe(
      parser
    );
  });

  if (isEmpty(rawBills)) return;

  await prisma.bill.createMany({
    data: rawBills.map((item) => ({
      amount: +item.amount,
      categoryId: item.category,
      type: Number(item.type) === 0 ? BillType.EXPENDITURE : BillType.REVENUE,
      time: new Date(+item.time),
    })),
  });
}
