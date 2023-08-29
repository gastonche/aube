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
    const routes =
      Reflect.getMetadata(ROUTE_DEFINITIONS, target.constructor) ?? [];
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
export const All = (path = "/", options?: Omit<RouteOptions, "all">) =>
  httpMethod({ ...options, path, method: "delete" });
export const Options = (path = "/", options?: Omit<RouteOptions, "options">) =>
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

export const Input = <T = string>(key?: string, defaultValue?: T) => {
  return createHttpMethodParamValueInjector((req) =>
    key ? req.input<T>(key, defaultValue) : req.input()
  );
};
export const Params = <T = string>(key?: string, defaultValue?: T) => {
  return createHttpMethodParamValueInjector((req) =>
    key ? req.params<T>(key, defaultValue) : req.params()
  );
};
export const Query = <T = string>(key?: string) => {
  return createHttpMethodParamValueInjector((req) =>
    key ? req.query<T>(key) : req.query()
  );
};
