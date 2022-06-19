/**
 * 业务类型报错
 */
export class BizError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BizError";
  }
}
