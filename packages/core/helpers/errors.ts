import { HttpError } from "../app";
import { getErrorHandler } from "../app/errors/ErrorHandler";
import { HttpStatusCode } from "../app/errors/messages";

export function abort(status: HttpStatusCode, message?: string) {
  throw new HttpError(status, message);
}

export function report(error: Error) {
  getErrorHandler().handle(error);
}
