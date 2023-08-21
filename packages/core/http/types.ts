import { Request, Response } from "express";

export interface ControllerOptions {
  path: string | string[];
}

export interface Constructable<T = any> {
  new (...params: any[]): T;
}

export interface RouteOptions {
  path: string;
  method: "get" | "post" | "put" | "patch" | "delete";
}

export type HttpMethodParamDecoratorGetter = (
  req: Request,
  res: Response
) => void;
