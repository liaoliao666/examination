import prisma from "lib/prisma";
import { BillType } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse";
import { isEmpty, pick } from "lodash-es";
import { CategoryList } from "services/category/scheme";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CategoryList>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  if (!(await prisma.category.count())) await initTable();

  const list = await prisma.category.findMany();

  res.status(200).json(list);
}

// 初始化表
async function initTable() {
  const rawCategories = await new Promise<
    {
      id: string;
      name: string;
      type: string;
    }[]
  >((resolve, reject) => {
    const parser = parse({ columns: true }, function (err, records) {
      if (err) reject(err);
      resolve(records);
    });
    fs.createReadStream(path.join(process.cwd(), "public/categories.csv")).pipe(
      parser
    );
  });

  if (isEmpty(rawCategories)) return;

  await prisma.category.createMany({
    data: rawCategories.map((item) => ({
      ...pick(item, ["id", "name"]),
      type: Number(item.type) === 0 ? BillType.EXPENDITURE : BillType.REVENUE,
    })),
  });
}
