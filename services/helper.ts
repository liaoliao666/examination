import { ServerError } from "lib/server-error";
import { BizError } from "lib/biz-error";
import { isEmpty } from "lodash-es";

function isServerError(err: any): err is ServerError {
  return err instanceof Object && Object.hasOwn(err, "ret");
}

const request = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then(async (res) => {
    const data = await res.json();

    // 业务错误处理
    if (isServerError(data)) {
      throw new BizError(data.msg);
    }

    return data;
  });

export const host = "http://localhost:3000";

export function POST<T extends any = unknown>(
  url: string,
  args: Record<string, any> = {}
): Promise<T> {
  return request(`${host}${url}`, {
    body: JSON.stringify(args ?? {}),
    headers: new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
    method: "POST",
  });
}

export function PUT<T extends any = unknown>(
  url: string,
  args: Record<string, any> = {}
): Promise<T> {
  return request(`${host}${url}`, {
    body: JSON.stringify(args ?? {}),
    headers: new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
    method: "PUT",
  });
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

  return request(`${host}${convertUrl}`, {
    headers: new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
  });
}

export function DELETE<T extends any = unknown>(
  url: string,
  args: Record<string, any> = {}
): Promise<T> {
  return request(`${host}${url}`, {
    body: JSON.stringify(args ?? {}),
    headers: new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
    method: "DELETE",
  });
}
