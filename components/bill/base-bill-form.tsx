import { ErrorMessage } from "@hookform/error-message";
import { Bill } from "@prisma/client";
import { find } from "lodash-es";
import { Controller, useFormContext } from "react-hook-form";
import { useQuery } from "react-query";
import { billTypeOptions } from "lib/scheme/bill";
import { CategoryKeys, CategoryService } from "services/category";
import { InformationCircleIcon } from "@heroicons/react/solid";
import StyledSelect from "../styled-select";

export default function BaseBillForm({ error }: { error?: Error }) {
  const {
    control,
    formState: { errors },
    register,
    getValues,
    trigger,
  } = useFormContext<Bill>();

  // 查询账单分类列表
  const categoryQuery = useQuery([CategoryKeys.LIST], () =>
    CategoryService.list()
  );

  return (
    <>
      {error ? (
        <div className="alert alert-error shadow-lg mb-4">
          <div>
            <InformationCircleIcon className="w-6 h-6" />
            <span>{error.message}</span>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 grid-cols-2">
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">账单时间</span>

            <ErrorMessage
              errors={errors}
              name="time"
              render={({ message }) => (
                <span className="label-text-alt text-error">{message}</span>
              )}
            />
          </label>

          <input
            {...register("time")}
            type="datetime-local"
            className="input"
            placeholder="请选择账单时间"
          />
        </div>

        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">账单金额</span>

            <ErrorMessage
              errors={errors}
              name="amount"
              render={({ message }) => (
                <span className="label-text-alt text-error">{message}</span>
              )}
            />
          </label>

          <input
            {...register("amount")}
            type="number"
            className="input"
            placeholder="请输入账单金额"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">账单类型</span>

            <ErrorMessage
              errors={errors}
              name="type"
              render={({ message }) => (
                <span className="label-text-alt text-error">{message}</span>
              )}
            />
          </label>

          <Controller
            control={control}
            name="type"
            render={({ field: { value, onChange } }) => {
              return (
                <StyledSelect
                  value={find(billTypeOptions, { value })}
                  options={billTypeOptions}
                  onChange={(v) => {
                    onChange(v?.value);
                    trigger("categoryId");
                  }}
                  isClearable
                  placeholder="请选择账单类型"
                />
              );
            }}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">账单分类</span>

            <ErrorMessage
              errors={errors}
              name="categoryId"
              render={({ message }) => (
                <span className="label-text-alt text-error">{message}</span>
              )}
            />
          </label>

          <Controller
            control={control}
            name="categoryId"
            render={({ field: { value, onChange } }) => {
              const type = getValues("type");
              const categoryOptions =
                categoryQuery.data
                  ?.filter((item) => (type ? item.type === type : true))
                  .map((item) => ({
                    label: item.name,
                    value: item.id,
                  })) || [];

              return (
                <StyledSelect
                  value={find(categoryOptions, { value: value! })}
                  options={categoryOptions}
                  onChange={(v) => {
                    onChange(v?.value);
                  }}
                  isClearable
                  placeholder="请选择账单分类"
                />
              );
            }}
          />
        </div>
      </div>
    </>
  );
}
