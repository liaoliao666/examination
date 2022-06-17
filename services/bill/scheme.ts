import { Bill, BillType } from "@prisma/client";
import dayjs from "dayjs";
import * as yup from "yup";

const orderScheme = yup.mixed().oneOf(["asc", "desc"]);

export const searchBillListArgsScheme = yup.object({
  pageIndex: yup.number().required().min(0).integer(),
  pageSize: yup.number().required().min(0).integer(),
  categoryIds: yup.array().of(yup.string().required()),
  type: yup.mixed().oneOf(Object.values(BillType)),
  startTime: yup
    .date()
    .transform((value) => (dayjs(value).isValid() ? value : undefined)),
  endTime: yup
    .date()
    .when(
      "startTime",
      (startTime, schema) =>
        startTime && schema.min(startTime, "结束时间不能小于开始时间")
    )
    .transform((value) => (dayjs(value).isValid() ? value : undefined)),
  orderBy: yup.object({
    time: orderScheme,
    amount: orderScheme,
  }),
});

export type SearchBillListArgs = yup.InferType<typeof searchBillListArgsScheme>;

export const billDtoScheme = yup.object({
  type: yup.mixed().oneOf(Object.values(BillType)).required("请选择账单类型"),
  time: yup
    .date()
    .transform((value) => (dayjs(value).isValid() ? value : undefined))
    .required("请选择账单时间"),
  categoryId: yup.string(),
  amount: yup.number().positive("账单金额需大于0").required("请输入账单金额"),
});

export type BillDto = yup.InferType<typeof billDtoScheme>;

export type BillList = {
  list: Bill[];
  pageCount: number;
  totalExpenses: number | null;
  totalRevenue: number | null;
};

export const billTypeOptions: { label: string; value: BillType }[] = [
  { label: "支出", value: BillType.EXPENDITURE },
  { label: "收入", value: BillType.REVENUE },
];
