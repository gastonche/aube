import Container from "typedi";
import { Constructable, HttpMethodParamDecoratorGetter } from "../types";
import { DetailedMiddlewareDefinition, MiddlewareClass, MiddlewarePrototype } from "./types";
import { Request, Response } from "express";
import { getControllerMethodParamInjectorName } from "../../constants";

function createInstantiator(controller: Constructable, propertyKey: string) {
  return (Middleware: MiddlewarePrototype) => {
    return new Middleware(controller, propertyKey);
  };
}

export function applyMiddlewares(
  request: Request,
  controller: Constructable,
  propertyKey: string,
  middlewares: DetailedMiddlewareDefinition[]
) {
  const instantiate = createInstantiator(controller, propertyKey);
  async function applyMiddleware(
    req: Request,
    index: number
  ): Promise<unknown> {
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
  controller: Constructable,
  propertyKey: string,
  req: Request,
  res: Response,
  middlewares: DetailedMiddlewareDefinition[]
) {
  const instantiate = createInstantiator(controller, propertyKey);
  middlewares.forEach(({ handler }) =>
    instantiate(handler).terminate?.(req, res)
  );
}


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
  
