import { Constructable, HttpMethodParamDecoratorGetter } from "../types";
import {
  DetailedMiddlewareDefinition,
  MiddlewareClass,
  MiddlewarePrototype,
} from "./types";
import { getControllerMethodParamInjectorName } from "../../constants";
import { Container } from "../../injector";
import Request from "../request";
import Response from "../response";

function instantiate(Middleware: MiddlewarePrototype) {
  try {
    return Container.get(Middleware);
  } catch (error) {
    return new Middleware();
  }
}

export function applyMiddlewares(
  request: Request,
  middlewares: DetailedMiddlewareDefinition[]
) {
  async function applyMiddleware(
    req: Request,
    index: number
  ): Promise<ReturnType<MiddlewareClass["handle"]>> {
    const { handler: Middleware, value } = middlewares[index];
    return await instantiate(Middleware).handle(
      req,
      (req) => applyMiddleware(req, index + 1),
      value
    );
  }

  return applyMiddleware(request, 0);
}

export function terminateMiddleware(
  req: Request,
  res: Response,
  middlewares: DetailedMiddlewareDefinition[]
) {
  middlewares.forEach(({ handler }) =>
    instantiate(handler).terminate?.(req, res)
  );
}

export function createExecuteMethodMiddleware(
  controller: Constructable,
  propertyKey: string,
  res: Response
) {
  class ExecuteRequestEnpoint implements MiddlewareClass {
    handle(request: Request) {
      const getters: HttpMethodParamDecoratorGetter[] =
        Reflect.getMetadata(
          getControllerMethodParamInjectorName(propertyKey),
          controller.prototype
        ) ?? [];

      const params = Reflect.getMetadata(
        "design:paramtypes",
        controller.prototype,
        propertyKey
      ).map((_: unknown, i: number) => getters[i]);
      if (!params.every(Boolean)) {
        throw Error(
          `Can't find injected value for some params of ${propertyKey}`
        );
      }
      return Container.get(controller)[propertyKey](
        ...params.map((getter: HttpMethodParamDecoratorGetter) =>
          getter(request, res)
        )
      );
    }
  }

  return { handler: ExecuteRequestEnpoint };
}
