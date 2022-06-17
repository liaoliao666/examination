// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import prisma from "lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { billDtoScheme } from "services/bill/scheme";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { body, method, query } = req;

  const args = await billDtoScheme.validate(body);

  switch (method) {
    case "POST": {
      const result = await prisma.bill.create({
        data: args,
      });
      res.status(200).json(result);
      break;
    }
    case "PUT": {
      const result = await prisma.bill.update({
        data: args,
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
