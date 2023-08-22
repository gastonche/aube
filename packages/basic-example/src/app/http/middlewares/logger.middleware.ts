import {
  MiddlewareClass,
  MiddlewareNext,
} from "@aube/core/http/middleware/types";
import { Request } from "express";

export default class RequestLoggerMiddleware implements MiddlewareClass {
  async handle(request: Request, next: MiddlewareNext) {
    const res = await next(request);
    console.log(new Date());
    return res;
  }
}
