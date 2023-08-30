import { HttpStatusCode } from "../app/errors/messages";

export interface CookieOptions {
  maxAge?: number | undefined;
  signed?: boolean | undefined;
  expires?: Date | undefined;
  httpOnly?: boolean | undefined;
  path?: string | undefined;
  domain?: string | undefined;
  secure?: boolean | undefined;
  encode?: ((val: string) => string) | undefined;
  sameSite?: boolean | "lax" | "strict" | "none" | undefined;
  plain?: boolean
}

export interface Cookie<T = any> {
  name: string;
  value: T;
  options: CookieOptions;
}

export interface HttpResponse<Res = any, ResBody = any> {
  res: Res;
  headersSent: boolean;
  appendHeader: (field: string, value?: string[] | string) => void;
  setCookie<T = string | any>(
    name: string,
    value: T,
    options?: CookieOptions
  ): void;
  attachment(path?: string): void;
  clearCookie: (name: string, options?: CookieOptions) => void;
  onFinish(fn: () => void): void;
  status(status: number): void;
  write(body: ResBody): void;
  send(body: ResBody): void;
  download(
    path: string,
    filename?: string,
    headers?: Download["headers"]
  ): void;
  end(): void;
  jsonp(body: ResBody): void;
  get(header: string): string | undefined;
  location: (location: string) => void;
  redirect(path: string, status: number): void;
}

interface Download {
  path: string;
  filename?: string;
  headers?: { [key: string]: string | string[] };
}

interface Redirect {
  location: string;
  status?: HttpStatusCode;
}

type StreamFunction<Body = any> = (
  write: (body: Body) => void
) => Promise<void>;

export default class Response<Res = any, ResBody = any> {
  private body?: ResBody;
  private downloadDetails?: Download;
  public jsonpCallback = false;
  private streamFn?: StreamFunction<ResBody>;
  private redirect?: Redirect;

  constructor(private response: HttpResponse<Res>) {}

  getHttpResponse() {
    return this.response;
  }

  getBody() {
    return this.body;
  }

  getDownloadDetails() {
    return this.downloadDetails;
  }

  getStreamFn() {
    return this.streamFn;
  }

  getRedirect() {
    return this.redirect;
  }

  header(key: string, value: string | string[]) {
    this.response.appendHeader(key, value);
    return this;
  }

  withHeaders(headers: { [key: string]: string | string[] }) {
    Object.keys(headers).forEach((key) => this.header(key, headers[key]));
    return this;
  }

  private ensureCookieIsSigned(options?: CookieOptions) {
    const opts: CookieOptions = options ?? {};
    if (options?.signed !== false) {
      opts.signed = true;
    }
    return opts;
  }

  cookie(cookie: Cookie): Response;
  cookie(
    cookie: string,
    value: string | any,
    options?: CookieOptions
  ): Response;
  cookie(
    cookie: string | Cookie,
    value?: string | any,
    options?: CookieOptions
  ) {
    if (typeof cookie === "object") {
      this.response.setCookie(
        cookie.name,
        cookie.value,
        this.ensureCookieIsSigned(cookie.options)
      );
    } else {
      this.response.setCookie(
        cookie,
        value,
        this.ensureCookieIsSigned(options)
      );
    }
    return this;
  }

  withoutCookie(name: string, options?: CookieOptions) {
    this.response.clearCookie(name, options);
    return this;
  }

  status(status: HttpStatusCode) {
    this.response.status(status);
    return this;
  }

  send(body: ResBody, status?: HttpStatusCode) {
    this.body = body;
    status && this.status(status);
    return this;
  }

  json(body: { [k: string | number]: any }, status?: HttpStatusCode) {
    this.body = body as ResBody;
    status && this.status(status);
    return this;
  }

  jsonp(body: { [k: string | number]: any } | any, status?: HttpStatusCode) {
    this.body = body as ResBody;
    status && this.status(status);
    this.jsonpCallback = true;
    return this;
  }

  text(text: string) {
    this.body = text as ResBody;
    return this;
  }

  attachment(path?: string) {
    this.response.attachment(path);
    return this;
  }

  download(path: string, filename?: string, headers?: Download["headers"]) {
    this.downloadDetails = { filename, headers, path };
    return this;
  }

  streamDownload(fn: StreamFunction) {
    this.streamFn = fn;
  }

  get(header: string) {
    return this.response.get(header);
  }

  location(location: string) {
    this.response.location(location);
    return this;
  }

  redirectTo(location: string, status?: HttpStatusCode) {
    return (this.redirect = { location, status });
  }

  redirectToRoute(route: string, status?: HttpStatusCode) {
    this.redirectTo("", status);
  }

  redirectBack(status?: HttpStatusCode) {
    this.redirectTo("back", status);
  }
}
