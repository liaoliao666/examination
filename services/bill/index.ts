import { Bill } from "@prisma/client";
import { POST, PUT } from "services/api-fn";
import { BillDto, BillList, SearchBillListArgs } from "./scheme";

export enum BillKeys {
  SEARCH = "SEARCH",
}

export const BillService = {
  search: (args: SearchBillListArgs) =>
    POST<BillList>("/api/bills/search", args),
  create: (args: BillDto) => POST<BillList>("/api/bills", args),
  update: ({ id, ...args }: Bill) => PUT<BillList>(`/api/bills/${id}`, args),
};
