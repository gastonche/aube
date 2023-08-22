import { Request } from "express";
import {
  EXCLUDED_MIDDLEWARE_DEFINITIONS,
  INCLUDED_MIDDLEWARE_DEFINITIONS,
} from "../../constants";
import { Constructable, HttpMethod } from "../types";
import { DetailedMiddlewareDefinition, MiddlewareDefinition } from "./types";

export interface MiddlewareMetadata {
  propertyKey: string | symbol;
  definition: MiddlewareDefinition;
}

function getMiddlewares(key: symbol) {
  return (
    controller: Constructable,
    propertyKey?: string | symbol
  ): MiddlewareDefinition[] => {
    const middlewares: MiddlewareMetadata[] =
      Reflect.getMetadata(key, controller) ?? [];
    return middlewares
      .filter(
        (middleware) =>
          !middleware.propertyKey || middleware.propertyKey === propertyKey
      )
      .map((middleware) => middleware.definition);
  };
}

export const getExcludedMiddlewares = getMiddlewares(
  EXCLUDED_MIDDLEWARE_DEFINITIONS
);
export const getIncludedMiddlewares = getMiddlewares(
  INCLUDED_MIDDLEWARE_DEFINITIONS
);

export function applyMiddlewares(
  request: Request,
  controller: Constructable,
  propertyKey: string,
  ...middlewares: DetailedMiddlewareDefinition[]
) {
  async function applyMiddleware(
    req: Request,
    index: number
  ): Promise<unknown> {
    const { handler: Middleware, value } = middlewares[index];
    const middleware = new Middleware(controller, propertyKey);
    return await middleware.handle(
      req,
      (req) => applyMiddleware(req, index + 1),
      value
    );
  }

  return applyMiddleware(request, 0);
}
