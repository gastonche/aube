import {
  HttpController,
  HttpRequest,
  HttpResponse,
  HttpServerAdapterInterface,
  config,
} from "@aube/core";
import express, { Router, type Request, type Response } from "express";
import { Server } from "http";
import path from "path";
import { Options } from "./types";
import helmet from "helmet";
import cookieParser from "cookie-parser";

export default class ExpressHttpAdapter implements HttpServerAdapterInterface {
  public app = express();

  constructor(options?: Options) {
    this.app = express();
    this.registerMiddleware(options?.middleware);
  }

  private registerMiddleware(middleware: Options["middleware"]) {
    if (middleware?.json !== false) {
      this.app.use(express.json(middleware?.json));
    }
    if (middleware?.static !== false) {
      const { root = "/public", options = {} } = middleware?.static ?? {};
      this.app.use(express.static(root, options));
    }
    if (middleware?.urlencoded !== false) {
      this.app.use(express.urlencoded(middleware?.urlencoded));
    }
    if (middleware?.helmet !== false) {
      this.app.use(helmet(middleware?.helmet));
    }

    if (middleware?.cookies !== false) {
      this.app.use(cookieParser(config("app.key"), middleware?.cookies));
    }
  }

  private getHttpRequest(request: Request): HttpRequest<Request> {
    return {
      protocol: request.protocol,
      secure: request.secure,
      ip: request.ip,
      path: request.path,
      hostname: request.hostname,
      xhr: request.xhr,
      method: request.method,
      url: request.url,
      query: (request.query ?? {}) as any,
      body: request.body ?? ({} as any),
      originalUrl: request.originalUrl,
      params: request.params,
      req: request,
      cookies: { ...request.cookies, ...request.signedCookies },
      get: request.get,
      accepts: request.accepts,
    };
  }

  getHttpResponse(res: Response): HttpResponse {
    const onFinish = (fn: () => void) => {
      res.once("finish", fn);
    };
    return {
      onFinish: onFinish,
      headersSent: res.headersSent,
      appendHeader: res.append.bind(res),
      setCookie: res.cookie.bind(res),
      res,
      attachment: res.attachment.bind(res),
      clearCookie: res.clearCookie.bind(res),
      status: res.status.bind(res),
      write: res.write.bind(res),
      send: res.send.bind(res),
      download: (location, filename, headers) =>
        res.download(location, filename ?? path.basename(location), {
          headers,
        }),
      end: res.end.bind(res),
      jsonp: res.jsonp.bind(res),
      get: res.get.bind(res),
      location: res.location.bind(res),
      redirect: (location, status) => res.redirect(status, location),
    };
  }

  registerControllers(controllers: HttpController[]) {
    controllers.forEach(({ prefixes, methods }) => {
      const router = Router();
      prefixes.forEach((prefix) => this.app.use(prefix, router));
      methods.forEach(({ method, handler, path }) => {
        router[method]?.(path, (req, res) =>
          handler(this.getHttpRequest(req), this.getHttpResponse(res))
        );
      });
    });
  }

  listen(port: number, hostname = ""): Promise<Server> {
    return new Promise((resolve) => {
      const server = this.app.listen(port, hostname, () => {
        resolve(server);
      });
    });
  }
}
