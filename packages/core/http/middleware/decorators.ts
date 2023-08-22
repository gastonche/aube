import {
  EXCLUDED_MIDDLEWARE_DEFINITIONS,
  INCLUDED_MIDDLEWARE_DEFINITIONS,
} from "../../constants";
import type { MiddlewareDefinition } from "./types";
import { MiddlewareMetadata } from "./utils";

const middlewareDecorator = (key: symbol) => {
  return function Middleware(...middleware: MiddlewareDefinition[]) {
    return (target: object, propertyKey: string | symbol) => {
      const middlewares: MiddlewareMetadata[] =
        Reflect.getMetadata(key, target) ?? [];
      Reflect.defineMetadata(
        key,
        [
          ...middlewares,
          ...middleware.map((definition) => ({ definition, propertyKey })),
        ],
        target
      );
    };
  };
};

export const WithMiddleware = middlewareDecorator(
  INCLUDED_MIDDLEWARE_DEFINITIONS
);
export const WithoutMiddleware = middlewareDecorator(
  EXCLUDED_MIDDLEWARE_DEFINITIONS
);
