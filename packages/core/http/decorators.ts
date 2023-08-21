import "reflect-metadata";
import {
  CONTROLLER_DEFINITIONS,
  ROUTE_DEFINITIONS,
  getControllerMethodParamInjectorName,
} from "../constants";
import {
  ControllerOptions,
  HttpMethodParamDecoratorGetter,
  RouteOptions,
} from "./types";
import { Service } from "../injector";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";

export function Controller(
  paths: string | string[] = "/",
  options?: ControllerOptions
): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(CONTROLLER_DEFINITIONS, { paths, options }, target);
    Service()(target);
  };
}

function httpMethod(options: RouteOptions): MethodDecorator {
  return (target, propertyKey) => {
    const routes = Reflect.getMetadata(ROUTE_DEFINITIONS, target) ?? [];
    routes.push({ ...options, propertyKey });
    Reflect.defineMetadata(ROUTE_DEFINITIONS, routes, target.constructor);
  };
}

export const Get = (path = "/", options?: Omit<RouteOptions, "method">) =>
  httpMethod({ ...options, path, method: "get" });
export const Post = (path = "/", options?: Omit<RouteOptions, "method">) =>
  httpMethod({ ...options, path, method: "post" });
export const Put = (path = "/", options?: Omit<RouteOptions, "method">) =>
  httpMethod({ ...options, path, method: "put" });
export const Patch = (path = "/", options?: Omit<RouteOptions, "method">) =>
  httpMethod({ ...options, path, method: "patch" });
export const Delete = (path = "/", options?: Omit<RouteOptions, "method">) =>
  httpMethod({ ...options, path, method: "delete" });

export function createHttpMethodParamValueInjector(
  getter: HttpMethodParamDecoratorGetter
): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    const key = getControllerMethodParamInjectorName(propertyKey as string);
    const getters = Reflect.getMetadata(key, target) ?? [];
    getters[parameterIndex] = getter;
    Reflect.defineMetadata(key, getters, target);
  };
}

export const Request = createHttpMethodParamValueInjector((req) => req);
export const Response = createHttpMethodParamValueInjector((_, res) => res);

export const Body = (key?: string) => {
  return createHttpMethodParamValueInjector((req) =>
    key ? req.body[key] : req.body
  );
};
export const Params = (key?: string) => {
  return createHttpMethodParamValueInjector((req) =>
    key ? req.params[key] : req.params
  );
};
export const Query = (key?: string) => {
  return createHttpMethodParamValueInjector((req) =>
    key ? req.query[key] : req.query
  );
};
