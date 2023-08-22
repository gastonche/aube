import Container from "typedi";
import { getControllerMethodParamInjectorName } from "../../constants";
import { Constructable, HttpMethodParamDecoratorGetter } from "../types";
import { MiddlewareClass } from "./types";
import { Request, Response } from "express";

export function createExecuteMethodMiddleware(res: Response) {
  class ExecuteRequestEnpoint implements MiddlewareClass {
    constructor(
      private controller: Constructable,
      private propertyKey: string
    ) {}

    handle(request: Request) {
      const getters: HttpMethodParamDecoratorGetter[] =
        Reflect.getMetadata(
          getControllerMethodParamInjectorName(this.propertyKey),
          this.controller.prototype
        ) ?? [];

      const params = Reflect.getMetadata(
        "design:paramtypes",
        this.controller.prototype,
        this.propertyKey
      ).map((_: unknown, i: number) => getters[i]);
      if (!params.every(Boolean)) {
        throw Error(
          `Can't find injected value for some params of ${this.propertyKey}`
        );
      }
      return Container.get(this.controller)[this.propertyKey](
        ...params.map((getter: HttpMethodParamDecoratorGetter) =>
          getter(request, res)
        )
      );
    }
  }

  return { handler: ExecuteRequestEnpoint };
}
