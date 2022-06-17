import { Dialog } from "@headlessui/react";
import { Bill } from "@prisma/client";
import { find } from "lodash-es";
import { Controller, useForm } from "react-hook-form";
import { useQuery } from "react-query";
import Select from "react-select";
import { billTypeOptions } from "services/bill/scheme";
import { CategoryKeys, CategoryService } from "services/category";

export default function BillFormModal({
  defaultValues,
  open,
  onClose,
  onSuccess,
}: {
  defaultValues: Bill;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { control } = useForm<Bill>({
    defaultValues,
  });

  // 查询账单分类列表
  const categoryQuery = useQuery([CategoryKeys.LIST], () =>
    CategoryService.list()
  );

  return (
    <Dialog open={open} onClose={onClose}>
      <Dialog.Panel>
        <Dialog.Title>Deactivate account</Dialog.Title>
        <div className="grid gap-4 grid-cols-2">
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
              name="categoryId"
              render={({ field: { value, onChange } }) => {
                const categoryOptions = categoryQuery.data?.map((item) => ({
                  label: item.name,
                  value: item.id,
                }));

                return (
                  <Select
                    instanceId="categoryId-select"
                    value={categoryOptions}
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
        <Dialog.Description>
          This will permanently deactivate your account
        </Dialog.Description>

        <p>
          Are you sure you want to deactivate your account? All of your data
          will be permanently removed. This action cannot be undone.
        </p>

        {/* <button onClick={() => setIsOpen(false)}>Deactivate</button>
        <button onClick={() => setIsOpen(false)}>Cancel</button> */}
      </Dialog.Panel>
    </Dialog>
  );
}
