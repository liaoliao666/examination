import type { NextPage } from "next";
import Head from "next/head";
import {
  createTable,
  getCoreRowModel,
  useTableInstance,
} from "@tanstack/react-table";
import { Bill, BillType } from "@prisma/client";
import { useCallback, useMemo, useReducer } from "react";
import { dehydrate, QueryClient, useQuery } from "react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import dayjs from "dayjs";
import { formatMoney } from "utils/money";
import { yupResolver } from "@hookform/resolvers/yup";
import { BillKeys, BillService } from "services/bill";
import {
  billTypeOptions,
  SearchBillListArgs,
  searchBillListArgsScheme,
} from "services/bill/scheme";
import { CategoryKeys, CategoryService } from "services/category";
import { find, isEqual, omit } from "lodash-es";
import Select from "react-select";
import Sorter from "components/sorter";

const defaultValues = {
  pageIndex: 0,
  pageSize: 10,
} as SearchBillListArgs;

const table = createTable().setRowType<Bill>();

const Home: NextPage = () => {
  // 表单
  const {
    control,
    handleSubmit,
    register,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<SearchBillListArgs>({
    defaultValues,
    resolver: yupResolver(searchBillListArgsScheme),
  });
  const [submitValues, setSubmitValues] = useReducer(
    (prevValues: SearchBillListArgs, currValues: SearchBillListArgs) => {
      const omitValues = (values: Record<string, any>) =>
        omit(searchBillListArgsScheme.validateSync(values), [
          "pageIndex",
          "pageSize",
          "orderBy",
        ]);

      // 是否除 table 状态外，则其他搜索条件改变了
      const hasChangedWithoutTable = !isEqual(
        omitValues(prevValues),
        omitValues(currValues)
      );

      if (hasChangedWithoutTable) {
        setValue("pageIndex", 0);
      }

      return getValues();
    },
    getValues()
  );
  const submit = useCallback(
    () => handleSubmit(setSubmitValues)(),
    [handleSubmit]
  );

  // 查询账单列表
  const billListQuery = useQuery(
    [BillKeys.SEARCH, submitValues],
    () => BillService.search(submitValues),
    {
      keepPreviousData: true,
    }
  );

  // 查询账单分类列表
  const categoryQuery = useQuery([CategoryKeys.LIST], () =>
    CategoryService.list()
  );

  // 表格
  const [pageIndex, pageSize] = useWatch({
    control,
    name: ["pageIndex", "pageSize"],
  });
  const pagination = useMemo(
    () => ({ pageIndex, pageSize }),
    [pageIndex, pageSize]
  );
  const instance = useTableInstance(table, {
    data: billListQuery.data?.list ?? [],
    columns: useMemo(() => {
      const categoryNameMap = Object.fromEntries(
        (categoryQuery.data ?? []).map((item) => [item.id, item.name])
      );

      function getSorter({
        name,
        title,
      }: {
        name: "time" | "amount";
        title: string;
      }) {
        return (
          <Controller
            control={control}
            name={`orderBy.${name}`}
            render={({ field: { value, onChange } }) => {
              return (
                <div
                  onClick={() => {
                    onChange(
                      !value ? "asc" : value === "asc" ? "desc" : undefined
                    );
                    submit();
                  }}
                  className="flex cursor-pointer text-black hover:text-opacity-60"
                >
                  {title} <Sorter className="ml-auto" order={value} />
                </div>
              );
            }}
          />
        );
      }

      return [
        table.createDataColumn((_, i) => i + pageIndex * pageSize + 1, {
          id: "serial",
          cell: (info) => info.getValue(),
          header: "序号",
          footer: (props) => props.column.id,
        }),
        table.createDataColumn("type", {
          cell: (info) =>
            find(billTypeOptions, { value: info.getValue() })?.label,
          footer: (props) => props.column.id,
          header: "账单类型",
        }),
        table.createDataColumn("time", {
          cell: (info) =>
            info.getValue() &&
            dayjs(info.getValue()).format("YYYY-MM-DD HH:mm:ss"),
          footer: (props) => props.column.id,
          header: () =>
            getSorter({
              title: "账单时间",
              name: "time",
            }),
          enableSorting: true,
        }),
        table.createDataColumn("categoryId", {
          cell: (info) => info.getValue() && categoryNameMap[info.getValue()!],
          footer: (props) => props.column.id,
          header: "账单分类",
        }),
        table.createDataColumn("amount", {
          cell: (info) => formatMoney(info.getValue()),
          footer: (props) => props.column.id,
          header: () =>
            getSorter({
              title: "账单金额",
              name: "amount",
            }),
        }),
      ];
    }, [categoryQuery.data, control, pageIndex, pageSize, submit]),
    pageCount: billListQuery.data?.pageCount ?? -1,
    state: {
      pagination,
    },
    onPaginationChange: (updater) => {
      const paginationState =
        typeof updater === "function" ? updater(pagination) : updater;
      setValue("pageIndex", paginationState.pageIndex);
      setValue("pageSize", paginationState.pageSize);
      submit();
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    debugTable: true,
  });

  return (
    <div className="p-2">
      <Head>
        <title>xmind记账</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="border-base-300 bg-base-200 border grid grid-cols-4 gap-2 p-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">账单类型</span>
          </label>

          <Controller
            control={control}
            name="type"
            render={({ field: { value, onChange } }) => (
              <Select
                instanceId="type-select"
                value={find(billTypeOptions, { value })}
                options={billTypeOptions}
                onChange={(v) => {
                  onChange(v?.value);
                  submit();
                }}
                isClearable
                placeholder="请选择账单类型"
              />
            )}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">账单分类</span>
          </label>

          <Controller
            control={control}
            name="categoryIds"
            render={({ field: { value, onChange } }) => {
              const categoryOptions = categoryQuery.data?.map((item) => ({
                label: item.name,
                value: item.id,
              }));
              const valueSet = new Set(value);

              return (
                <Select
                  instanceId="categoryIds-select"
                  value={categoryOptions?.filter((item) =>
                    valueSet.has(item.value)
                  )}
                  options={categoryOptions}
                  onChange={(v) => {
                    onChange(v?.map((item) => item.value));
                    submit();
                  }}
                  isClearable
                  isMulti
                  placeholder="请选择账单分类"
                />
              );
            }}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">开始时间</span>
          </label>

          <input
            {...register("startTime", {
              onChange: submit,
            })}
            type="datetime-local"
            className="input input-bordered h-[38px] rounded"
            placeholder="请选择开始时间"
          />

          <ErrorMessage
            errors={errors}
            name="startTime"
            render={({ message }) => (
              <label className="label">
                <span className="label-text-alt text-error">{message}</span>
              </label>
            )}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">结束时间</span>
          </label>

          <input
            {...register("endTime", { onChange: submit, deps: ["startTime"] })}
            type="datetime-local"
            className="input input-bordered h-[38px] rounded"
            placeholder="请选择结束时间"
          />

          <ErrorMessage
            errors={errors}
            name="endTime"
            render={({ message }) => (
              <label className="label">
                <span className="label-text-alt text-error">{message}</span>
              </label>
            )}
          />
        </div>
      </div>

      <div className="mt-4 mb-2">
        当前所选账单分类和所选时间的总收入为{" "}
        <span className="text-primary">
          {billListQuery.data?.totalRevenue != null
            ? formatMoney(billListQuery.data.totalRevenue)
            : "-"}
        </span>
        ，总支出为
        <span className="text-primary">
          {" "}
          {billListQuery.data?.totalExpenses != null
            ? formatMoney(billListQuery.data.totalExpenses)
            : "-"}
        </span>
      </div>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="table w-full">
          <thead>
            {instance.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <td
                      key={header.id}
                      colSpan={header.colSpan}
                      className="text-sm text-bold"
                    >
                      {header.isPlaceholder ? null : (
                        <div>{header.renderHeader()}</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {instance.getRowModel().rows.map((row) => {
              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return <td key={cell.id}>{cell.renderCell()}</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center py-4 justify-end gap-2">
        <button
          className="btn"
          onClick={() => instance.setPageIndex(0)}
          disabled={!instance.getCanPreviousPage()}
        >
          {"<<"}
        </button>
        <button
          className="btn"
          onClick={() => instance.previousPage()}
          disabled={!instance.getCanPreviousPage()}
        >
          {"<"}
        </button>
        <button
          className="btn"
          onClick={() => instance.nextPage()}
          disabled={!instance.getCanNextPage()}
        >
          {">"}
        </button>
        <button
          className="btn"
          onClick={() => instance.setPageIndex(instance.getPageCount() - 1)}
          disabled={!instance.getCanNextPage()}
        >
          {">>"}
        </button>

        <span className="flex items-center gap-1">
          <div>第</div>
          <strong>{instance.getState().pagination.pageIndex + 1} 页</strong>
        </span>
        <span className="flex items-center gap-1">
          <div>共</div>
          <strong>{instance.getPageCount()}</strong> 页
        </span>
        <span className="flex items-center gap-1">
          | 跳至:
          <input
            type="number"
            defaultValue={instance.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              instance.setPageIndex(page);
            }}
            className="input input-bordered input-sm w-20"
            min={1}
            max={instance.getPageCount()}
          />
          页
        </span>
        <select
          value={instance.getState().pagination.pageSize}
          onChange={(e) => {
            instance.setPageSize(Number(e.target.value));
          }}
          className="select select-bordered select-sm"
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              {pageSize} 条/页
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export async function getStaticProps() {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery([BillKeys.SEARCH, defaultValues], () =>
      BillService.search(defaultValues)
    ),
    queryClient.prefetchQuery([CategoryKeys.LIST], () =>
      CategoryService.list()
    ),
  ]);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}

export default Home;
