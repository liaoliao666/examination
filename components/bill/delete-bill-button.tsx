import { Bill } from "@prisma/client";
import clsx from "clsx";
import { useMutation } from "react-query";
import { BillService } from "services/bill";

export default function DeleteBillButton({
  className,
  defaultValues,
  onSuccess,
  onClick,
  ...rest
}: JSX.IntrinsicElements["button"] & {
  onSuccess: () => void;
  defaultValues: Bill;
}) {
  const { isLoading, mutate } = useMutation(BillService.delete, { onSuccess });

  return (
    <button
      className={clsx("btn", isLoading && "loading", className)}
      onClick={(ev) => {
        onClick?.(ev);
        mutate(defaultValues);
      }}
      {...rest}
    />
  );
}
