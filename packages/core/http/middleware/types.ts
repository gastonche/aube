import type { Request, Response } from "express";
import type { Constructable } from "../types";

export type MiddlewareNext<T = unknown> = (request: Request) => Promise<T>;

export interface MiddlewareClass {
  handle: (request: Request, next: MiddlewareNext, value: any) => unknown;
  terminate?: (request: Request, response: Response) => void;
}

export type MiddlewarePrototype = Constructable<MiddlewareClass>;

export type DetailedMiddlewareDefinition<T = unknown> = {
  handler: MiddlewarePrototype;
  value?: T;
};
export type MiddlewareDefinition =
  | string
  | MiddlewarePrototype
  | DetailedMiddlewareDefinition;
