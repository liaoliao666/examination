import type { NextPage } from "next";
import Head from "next/head";
import {
  createTable,
  getCoreRowModel,
  useTableInstance,
} from "@tanstack/react-table";
import { Bill, BillType } from "@prisma/client";
import { useCallback, useMemo, useReducer, useState } from "react";
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
} from "lib/scheme/bill";
import { CategoryKeys, CategoryService } from "services/category";
import { find, isEqual, omit } from "lodash-es";
import Sorter from "components/sorter";
import CreateBillForm from "components/bill/create-bill-form";
import StyledSelect from "components/styled-select";
import clsx from "clsx";
import UpdateBillForm from "components/bill/update-bill-form";
import DeleteBillButton from "components/bill/delete-bill-button";
import Pagination from "components/pagination";

const defaultValues = {
  pageIndex: 0,
  pageSize: 10,
  orderBy: {
    time: "desc",
  },
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

  // 新增账单
  const [createBillVisible, setCreateBillVisible] = useState(false);

  // 修改账单
  const [updateBillInfo, setUpdateBillInfo] = useState<{
    open: boolean;
    defaultValues?: Bill;
  }>({
    open: false,
  });

  // 删除账单
  const [deleteBillInfo, setDeleteBillInfo] = useState<{
    open: boolean;
    defaultValues?: Bill;
  }>({
    open: false,
  });

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
                    onChange(!value ? "asc" : value === "asc" ? "desc" : null);
                    submit();
                  }}
                  className="flex cursor-pointer hover:opacity-60"
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
        table.createDataColumn((_, i) => i, {
          id: "oprate",
          cell: (info) => (
            <div className="flex gap-2">
              <button
                className="btn btn-xs"
                onClick={() => {
                  setUpdateBillInfo({
                    open: true,
                    defaultValues: info.row.original,
                  });
                }}
              >
                修改
              </button>

              <button
                className="btn btn-xs"
                onClick={() => {
                  setDeleteBillInfo({
                    open: true,
                    defaultValues: info.row.original,
                  });
                }}
              >
                删除
              </button>
            </div>
          ),
          footer: (props) => props.column.id,
          header: "操作",
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

  const searchForm = (
    <div className="border-base-300 bg-base-200 border grid grid-cols-4 gap-2 p-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">账单类型</span>
        </label>

        <Controller
          control={control}
          name="type"
          render={({ field: { value, onChange } }) => (
            <StyledSelect
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
              <StyledSelect
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

          <ErrorMessage
            errors={errors}
            name="startTime"
            render={({ message }) => (
              <span className="label-text-alt text-error">{message}</span>
            )}
          />
        </label>

        <input
          {...register("startTime", {
            onChange: submit,
          })}
          type="datetime-local"
          className="input"
          placeholder="请选择开始时间"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">结束时间</span>

          <ErrorMessage
            errors={errors}
            name="endTime"
            render={({ message }) => (
              <span className="label-text-alt text-error">{message}</span>
            )}
          />
        </label>

        <input
          {...register("endTime", { onChange: submit, deps: ["startTime"] })}
          type="datetime-local"
          className="input"
          placeholder="请选择结束时间"
        />
      </div>
    </div>
  );

  return (
    <div className="p-2">
      <Head>
        <title>xmind记账</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {searchForm}

      <div className="mt-4 mb-2 flex items-center">
        <div>
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

        <button
          className="btn ml-auto"
          onClick={() => {
            setCreateBillVisible(true);
          }}
        >
          创建账单
        </button>
      </div>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="table w-full">
          <thead>
            {instance.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : (
                        <div>{header.renderHeader()}</div>
                      )}
                    </th>
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

      <Pagination instance={instance} />

      <div className={clsx("modal", createBillVisible && "modal-open")}>
        <div className="modal-box bg-base-200">
          <h3 className="font-bold text-lg mb-4">新增账单</h3>

          {createBillVisible && (
            <CreateBillForm
              onCancel={() => {
                setCreateBillVisible(false);
              }}
              onSuccess={() => {
                setCreateBillVisible(false);
                billListQuery.refetch();
              }}
            />
          )}
        </div>
      </div>

      <div className={clsx("modal", updateBillInfo.open && "modal-open")}>
        <div className="modal-box bg-base-200">
          <h3 className="font-bold text-lg mb-4">更新账单</h3>

          {updateBillInfo.open && updateBillInfo.defaultValues && (
            <UpdateBillForm
              defaultValues={updateBillInfo.defaultValues}
              onCancel={() => {
                setUpdateBillInfo({
                  open: false,
                });
              }}
              onSuccess={() => {
                setUpdateBillInfo({
                  open: false,
                });
                billListQuery.refetch();
              }}
            />
          )}
        </div>
      </div>

      <div className={clsx("modal", deleteBillInfo.open && "modal-open")}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">是否确定删除账单</h3>
          <div className="modal-action">
            <button
              className="btn btn-outline"
              onClick={() => {
                setDeleteBillInfo({ open: false });
              }}
            >
              取消
            </button>
            {deleteBillInfo.open && deleteBillInfo.defaultValues && (
              <DeleteBillButton
                defaultValues={deleteBillInfo.defaultValues}
                onSuccess={() => {
                  setDeleteBillInfo({
                    open: false,
                  });
                  billListQuery.refetch();
                }}
              >
                确定
              </DeleteBillButton>
            )}
          </div>
        </div>
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
