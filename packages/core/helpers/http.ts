import { Container } from "../injector";
import { Request, Response } from "../http";

export function request() {
  return Container.get(Request);
}

export function response<T = any>(body?: T, status?: number) {
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
