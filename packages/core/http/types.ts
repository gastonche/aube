import { Request, Response } from "express";

export interface ControllerOptions {
  path: string | string[];
}

export interface Constructable<T = any> {
  new (...params: any[]): T;
}

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

export interface RouteOptions {
  path: string;
  method: HttpMethod;
}

export type HttpMethodParamDecoratorGetter = (
  req: Request,
  res: Response
) => void;
