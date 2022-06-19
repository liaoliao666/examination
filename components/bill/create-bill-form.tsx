import { yupResolver } from "@hookform/resolvers/yup";
import { Bill } from "@prisma/client";
import clsx from "clsx";
import { FormProvider, useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { BillService } from "services/bill";
import { billDtoScheme } from "lib/scheme/bill";
import BaseBillForm from "./base-bill-form";

export default function CreateBillForm({
  onCancel,
  onSuccess,
}: {
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const methods = useForm<Bill>({
    resolver: yupResolver(billDtoScheme),
  });

  const { handleSubmit } = methods;

  const { isLoading, mutate, error } = useMutation(BillService.create, {
    onSuccess,
  });

  return (
    <>
      <FormProvider {...methods}>
        <BaseBillForm error={error as Error} />
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
