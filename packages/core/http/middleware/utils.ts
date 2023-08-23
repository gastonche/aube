import { Request } from "express";
import {
  EXCLUDED_MIDDLEWARE_DEFINITIONS,
  INCLUDED_MIDDLEWARE_DEFINITIONS,
} from "../../constants";
import { Constructable } from "../types";
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
      Reflect.getMetadata(key, controller.prototype) ?? [];
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
