import { yupResolver } from "@hookform/resolvers/yup";
import { Bill } from "@prisma/client";
import clsx from "clsx";
import { FormProvider, useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { BillService } from "services/bill";
import { billDtoScheme } from "lib/scheme/bill";
import BaseBillForm from "./base-bill-form";

export default function UpdateBillForm({
  onCancel,
  onSuccess,
  defaultValues,
}: {
  onCancel: () => void;
  onSuccess: () => void;
  defaultValues: Bill;
}) {
  const methods = useForm<Bill>({
    defaultValues,
    resolver: yupResolver(billDtoScheme),
  });

  const { handleSubmit } = methods;

  const { isLoading, mutate, error } = useMutation(BillService.update, {
    onSuccess: () => {
      console.log(111);
      onSuccess();
    },
  });

  return (
    <>
      <FormProvider {...methods}>
        <BaseBillForm error={error as any} />
      </FormProvider>

      <div className="modal-action">
        <button className="btn btn-outline" onClick={onCancel}>
          取消
        </button>
        <button
          className={clsx("btn", isLoading && "loading")}
          onClick={() => {
            if (isLoading) return;

            handleSubmit((values) => {
              mutate(values);
            })();
          }}
        >
          确定
        </button>
      </div>
    </>
  );
}
