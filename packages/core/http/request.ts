import get from "lodash.get";
import { Constructable, HttpMethod } from "./types";

export interface HttpRequest<Req = any> {
  protocol: string;
  secure: boolean;
  ip: string;
  path: string;
  hostname: string;
  xhr: boolean;
  method: string;
  url: string;
  query: {
    [queryParam: string]: string | undefined;
  };
  cookies: {
    [cookieName: string]: string | undefined;
  };
  body: {
    [queryParam: string]: string;
  };
  originalUrl: string;
  params: {
    [param: string]: string;
    [captureGroup: number]: string;
  };
  req: Req;
  get(name: string): string | undefined;
  accepts(key: string): boolean | string;
}

type HttpAction<T = any> = [controller: Constructable<T>, action: string];

export default class Request<T = any> {
  constructor(private request: HttpRequest<T>, private action: HttpAction) {}

  get hostname() {
    return this.request.hostname;
  }

  get ip() {
    return this.request.ip;
  }

  get path() {
    return this.request.path;
  }

  get method(): HttpMethod {
    return this.request.method as HttpMethod;
  }

  get url() {
    return this.request.url;
  }

  get originalUrl() {
    return this.request.originalUrl;
  }

  get originalRequest(): T {
    return this.request.req;
  }

  get httpAction(): HttpAction {
    return [this.action[0], this.action[1]];
  }

  header(key: string, defaultValue?: string): string | undefined {
    return this.request.get(key) ?? defaultValue;
  }

  cookie(): HttpRequest["cookies"];
  cookie<T = string>(key: string, defaultValue?: T): T | undefined;
  cookie(key?: string, defaultValue?: string) {
    return key
      ? this.request.cookies[key] ?? defaultValue
      : this.request.cookies;
  }

  // TODO: implement properly when sessions are implemented
  session(key: string, defaultValue?: string) {
    return this.request.cookies[key] ?? defaultValue;
  }

  accepts(names: string | string) {
    return !!this.request.accepts(names);
  }

  prefers(names: string[]) {
    return names.find(this.accepts);
  }

  input(): HttpRequest["body"];
  input<T = string>(key: string, defaultValue?: T): T | undefined;
  input<T = string>(name?: string, defaultValue?: T) {
    return name
      ? get(this.request.body, name, defaultValue)
      : this.request.body;
  }

  query(): HttpRequest["query"];
  query<T = string>(key: string, defaultValue?: T): T | undefined;
  query<T = string>(name?: string, defaultValue?: T) {
    return name
      ? (get(this.request.query, name, defaultValue) as T | undefined)
      : this.request.query;
  }

  params(): HttpRequest["params"];
  params<T = string>(key: string, defaultValue?: T): T | undefined;
  params<T = string>(name?: string | number, defaultValue?: T) {
    return name || name === 0
      ? (get(this.request.params, name, defaultValue) as T | undefined)
      : this.request.params;
  }

  only(...names: string[]) {
    return names.reduce(
      (acc, name) => ({ ...acc, [name]: this.input(name) }),
      {}
    );
  }

  except(...names: string[]) {
    const input = this.input() ?? {};
    return Object.keys(input)
      .filter((key) => !names.includes(key))
      .reduce((acc, name) => ({ ...acc, [name]: this.input(name) }), {});
  }

  filled(name: string) {
    return !!this.input(name) || this.input<number>(name) === 0;
  }

  anyFilled(...names: string[]) {
    return names.some(this.filled);
  }

  whenFilled<T = string>(
    name: string,
    onFilled: (input: T) => void,
    onNotFilled?: () => void
  ) {
    if (this.filled(name)) {
      onFilled(this.input(name) as T);
    } else {
      onNotFilled?.();
    }
  }

  has(name: string) {
    return Object.keys(this.input() ?? {}).some((key) => name === key);
  }

  hasAny(...names: string[]) {
    return names.some(this.has);
  }

  whenHas<T>(name: string, onHas: (input: T) => void, onNotHas?: () => {}) {
    if (this.has(name)) {
      onHas(this.input(name) as T);
    } else {
      onNotHas?.();
    }
  }

  missing(name: string) {
    return !this.has(name);
  }

  whenMissing<T>(name: string, onMissing: () => void) {
    if (!this.has(name)) {
      onMissing();
    }
  }

  merge(input: { [key: string]: any }) {
    Object.keys(input).forEach((key) => {
      this.request.body[key] = input[key];
    });
  }

  mergeIfMissing(input: { [key: string]: any }) {
    Object.keys(input).forEach((key) => {
      if (this.has(key)) {
        this.request.body[key] = input[key];
      }
    });
  }
}
