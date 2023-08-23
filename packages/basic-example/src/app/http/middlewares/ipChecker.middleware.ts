import { MiddlewareClass, MiddlewareNext } from "@aube/core";
import { Request, Response } from "express";

export default class IpCheckerMiddleware implements MiddlewareClass {
  handle(request: Request, next: MiddlewareNext<unknown>, value: number) {
    const { ip } = request.query;

    if (ip && +ip === +value) {
      return next(request);
    }

    return { failed: 1 };
  }

  terminate(request: Request, response: Response) {
    console.log("request");
  }
}
