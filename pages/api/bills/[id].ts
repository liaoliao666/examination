// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import prisma from "lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { billDtoScheme } from "lib/scheme/bill";
import { getCommonServerError } from "lib/server-error";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { body, method, query } = req;

  switch (method) {
    case "PUT": {
      const data = await billDtoScheme.validate(body);

      const { type, categoryId } = data;

      // 校验账单分类是否合法
      if (categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: categoryId },
        });
        if (!category)
          return res.status(500).send(getCommonServerError("无法找到该分类"));
        if (category.type !== type)
          return res
            .status(500)
            .send(getCommonServerError("请选择正确的账单分类"));
      }

      const result = await prisma.bill.update({
        data,
        where: { id: query.id as string },
      });
      res.status(200).json(result);
      break;
    }
    case "DELETE": {
      const result = await prisma.bill.delete({
        where: { id: query.id as string },
      });
      res.status(200).json(result);
      break;
    }
    default:
      res.setHeader("Allow", ["POST", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
