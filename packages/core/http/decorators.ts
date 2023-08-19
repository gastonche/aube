import "reflect-metadata";
import { CONTROLLER_DEFINITIONS, REQUEST_DEFINITION, ROUTE_DEFINITIONS } from "../constants";
import { ControllerOptions, RouteOptions } from "./types";
import { Service, Container } from "../injector";

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
  httpMethod({ ...options, path, method: "GET" });
export const Post = (path = "/", options?: Omit<RouteOptions, "method">) =>
  httpMethod({ ...options, path, method: "POST" });
export const Put = (path = "/", options?: Omit<RouteOptions, "method">) =>
  httpMethod({ ...options, path, method: "PUT" });
export const Patch = (path = "/", options?: Omit<RouteOptions, "method">) =>
  httpMethod({ ...options, path, method: "PATCH" });
export const Delete = (path = "/", options?: Omit<RouteOptions, "method">) =>
  httpMethod({ ...options, path, method: "DELETE" });

export const Request =
  () => (object: Object, propertyName: string, index?: number) => {
    Container.registerHandler({
      object: object as any,
      propertyName,
      index,
      value: () => Reflect.getMetadata(REQUEST_DEFINITION, object),
    });
  };
