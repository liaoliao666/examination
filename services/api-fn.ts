import { isEmpty } from "lodash-es";
import { host } from "./host";

export function POST<T extends any = unknown>(
  url: string,
  args: Record<string, any> = {}
): Promise<T> {
  return fetch(`${host}${url}`, {
    body: JSON.stringify(args ?? {}),
    headers: new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
    method: "POST",
  }).then((res) => res.json());
}

export function PUT<T extends any = unknown>(
  url: string,
  args: Record<string, any> = {}
): Promise<T> {
  return fetch(`${host}${url}`, {
    body: JSON.stringify(args ?? {}),
    headers: new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
    method: "PUT",
  }).then((res) => res.json());
}

export function GET<T extends any = unknown>(
  url: string,
  args: Record<string, any> = {}
): Promise<T> {
  let convertUrl = url;
  if (!isEmpty(args)) {
    convertUrl += `${convertUrl.includes("?") ? "" : "?"}${Object.entries(args)
      .flatMap(([key, val]) =>
        (Array.isArray(val) ? val : [val]).map(
          (v) => `${key}=${encodeURIComponent(v ?? "")}`
        )
      )
      .join("&")}`;
  }

  return fetch(`${host}${convertUrl}`, {
    headers: new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
  }).then((res) => res.json());
}
