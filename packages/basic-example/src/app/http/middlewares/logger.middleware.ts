import { Request } from "@aube/core";
import {
  MiddlewareClass,
  MiddlewareNext,
} from "@aube/core/http/middleware/types";

export default class RequestLoggerMiddleware implements MiddlewareClass {
  async handle(request: Request, next: MiddlewareNext) {
    console.time("Executed");
    const res = await next(request);
    console.timeEnd("Executed");
    return res;
  }
}
