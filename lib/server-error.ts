export interface ServerError {
  msg: string;
  ret: number;
}

export function getCommonServerError(msg: string): ServerError {
  return { msg, ret: -1 };
}
