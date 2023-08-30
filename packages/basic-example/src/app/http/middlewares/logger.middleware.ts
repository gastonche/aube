import { Request, report, response } from "@aube/core";
import {
  MiddlewareClass,
  MiddlewareNext,
} from "@aube/core/http/middleware/types";

export default class RequestLoggerMiddleware implements MiddlewareClass {
  async handle(request: Request, next: MiddlewareNext) {
    try {
      console.time("Executed");
      const res = await next(request);
      console.timeEnd("Executed");
      return res;
    } catch (e) {
      report(e as Error);
      return response().streamDownload((write) => {
        write("{1: 1}");
        return Promise.resolve();
      });
    }
  }
}
