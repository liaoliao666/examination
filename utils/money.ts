import { isFinite, round } from "lodash-es";

/**
 * 格式化金钱
 */
export function formatMoney(number: number) {
  if (!isFinite(number)) return number;

  return round(number, 2)
    .toString()
    .replace(/^(-)*(\d+)\.(\d{2}).*$/, "$1$2.$3")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
