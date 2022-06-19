import { Bill } from "@prisma/client";
import { DELETE, POST, PUT } from "services/helper";
import { SearcBillListResponse, SearchBillListArgs } from "lib/scheme/bill";

export enum BillKeys {
  SEARCH = "SEARCH",
}

export const BillService = {
  search: (args: SearchBillListArgs) =>
    POST<SearcBillListResponse>("/api/bills/search", args),
  create: (args: Omit<Bill, "id">) =>
    POST<SearcBillListResponse>("/api/bills", args),
  update: ({ id, ...args }: Bill) =>
    PUT<SearcBillListResponse>(`/api/bills/${id}`, args),
  delete: ({ id }: Bill) => DELETE<SearcBillListResponse>(`/api/bills/${id}`),
};
