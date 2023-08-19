export interface ControllerOptions {
  path: string | string[];
}

export interface Constructable<T = any> {
  new (...params: any[]): T;
}

export interface RouteOptions {
  path: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
}
