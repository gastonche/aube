import { Server } from "http";
import Request, { HttpRequest } from "./request";
import Response, { HttpResponse } from "./response";

export interface ControllerOptions {
  path: string | string[];
}

export interface Constructable<T = any> {
  new (...params: any[]): T;
}

export interface ControllerMethod extends RouteOptions {
  propertyKey: string;
  handler: (req: HttpRequest, res: HttpResponse) => void;
}

export interface HttpController {
  constructor: Constructable;
  methods: ControllerMethod[];
  prefixes: string[];
}

export interface HttpServerAdapter {
  registerControllers: (controllers: HttpController[]) => void;
  listen: (port: number, host?: string) => Promise<Server>;
}

export type HttpMethod =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "options"
  | "all"
  | "head";
export interface RouteOptions {
  path: string;
  method: HttpMethod;
}

export type HttpMethodParamDecoratorGetter = (
  req: Request,
  res: Response
) => void;
