import Request from "../request";
import Response from "../response";
import type { Constructable } from "../types";

export type MiddlewareNext<T = unknown> = (request: Request) => Promise<T>;

export interface MiddlewareInterface {
  singleton?: boolean;
  handle: (
    request: Request,
    next: MiddlewareNext,
    ...value: any[]
  ) => Promise<any> | any; // TODO: implement multiple midldeware params
  terminate?: (request: Request, response: Response) => void;
}

export interface MiddlewareClass extends Constructable<MiddlewareInterface> {
  singleton?: boolean;
}

export type DetailedMiddlewareDefinition<T = unknown> = {
  handler: MiddlewareClass;
  value?: T;
};
export type MiddlewareDefinition =
  | string
  | MiddlewareClass
  | DetailedMiddlewareDefinition;
