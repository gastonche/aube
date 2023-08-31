import { Container } from "../injector";
import { Request, Response } from "../http";
import { HttpStatusCode } from "../app/errors/messages";
import Session from "../http/session/Session";

export function request() {
  return Container.get(Request);
}

export function response<T = any>(body?: T, status?: HttpStatusCode) {
  let res = Container.get(Response);
  if (status) {
    res.status(status);
  }
  if (body) {
    res.send(body);
  }
  return res;
}

// TODO: implement named route pickup
export function route(name: string) {
  return name;
}

export function session<T>(key: string, defaultValue?: T): T | undefined;
export function session(values: Record<string, any>): void;
export function session(): Session;
export function session<T>(
  key?: string | Record<string, any>,
  defaultValue?: T
) {
  const value = Container.get(Session);
  if (key) {
    if (typeof key === "string") {
      return value.get(key) ?? defaultValue;
    }
    Object.keys(key).forEach((k) => {
      value.set(k, key[k]);
    });
  }
  return value;
}
