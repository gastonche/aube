import { join } from "path";
import { loadFiles } from "../helpers/loader";
import {
  Constructable,
  ControllerMethod,
  HttpController,
  RouteOptions,
} from "../http/types";
import { CONTROLLER_DEFINITIONS, ROUTE_DEFINITIONS } from "../constants";
import {
  applyMiddlewares,
  createExecuteMethodMiddleware,
  terminateMiddleware,
} from "../http/middleware/handle";
import Provider from "./Provider";
import { Logger } from "../logger";
import { config, response as createResponse } from "../helpers";
import {
  HttpRequest,
  HttpResponse,
  HttpServerAdapter,
  Request,
  Response,
} from "../http";
import { Container } from "../injector";

export default class BaseRouteProvider extends Provider {
  protected controllersDir = "app/http/controllers/";
  protected logger = new Logger(`${config("app.name")}: RouteProvider`);

  private get controllers(): Constructable[] {
    return loadFiles(join(this.controllersDir, "/**/*.controller.ts")).map(
      ({ file }) => file.default
    );
  }

  get registeredControllers(): HttpController[] {
    return this.controllers.map((controller) => {
      const { paths } = Reflect.getMetadata(CONTROLLER_DEFINITIONS, controller);
      return {
        constructor: controller,
        prefixes: Array.isArray(paths)
          ? (paths as string[])
          : [paths as string],
        methods: this.getControllerMethods(controller),
      };
    });
  }

  printRouteTable() {
    const routes = this.registeredControllers.flatMap(
      ({ prefixes, constructor, methods }) =>
        prefixes.flatMap((prefix) =>
          methods.map(({ path, propertyKey, method }) => ({
            controller: `${constructor.name}@${propertyKey}`,
            path: join("/", prefix, "/", path),
            method,
          }))
        )
    );
    console.table(routes);
  }

  private getControllerMethods(controller: Constructable): ControllerMethod[] {
    const routes: (RouteOptions & { propertyKey: string })[] =
      Reflect.getMetadata(ROUTE_DEFINITIONS, controller) ?? [];

    return routes.map((route) => {
      return {
        ...route,
        handler: (req, res) => this.handleMethod(controller, route, req, res),
      };
    });
  }

  async handleMethod(
    controller: Constructable,
    route: RouteOptions & { propertyKey: string },
    req: HttpRequest,
    res: HttpResponse
  ) {
    /**
     * Create request and response instances
     * Set their values in service container
     */
    const request = new Request(req, [controller, route.propertyKey]);
    Container.set(Request, request);
    const response = new Response(res);
    Container.set(Response, response);

    const middlewares = [
      ...this.kernel.getMiddlewares(controller, route.propertyKey),
      createExecuteMethodMiddleware(controller, route.propertyKey, response),
    ];

    res.onFinish(() => terminateMiddleware(request, response, middlewares));
    try {
      const result = await applyMiddlewares(request, middlewares);
      await this.sendResponse(this.createResponse(result), res);
    } catch (e) {
      this.logger.trace(e);
      res.status(500);
      res.send(e);
    }
  }

  private createResponse(res: Response | unknown): Response {
    if (res instanceof Response) {
      return res;
    } else {
      return createResponse().send(res);
    }
  }

  private async sendResponse(res: Response, httpRes: HttpResponse) {
    const redirect = res.getRedirect();
    if (redirect) {
      return httpRes.redirect(redirect.location, redirect.status ?? 301);
    }

    const streamFn = res.getStreamFn();
    if (streamFn) {
      await streamFn(httpRes.write);
      httpRes.end();
    }

    if (res.jsonpCallback) {
      return httpRes.jsonp(res.getBody());
    }

    const downloadDetails = res.getDownloadDetails();
    if (downloadDetails) {
      return httpRes.download(
        downloadDetails.path,
        downloadDetails.filename,
        downloadDetails.headers
      );
    }

    return httpRes.send(res.getBody());
  }

  boot(): void {
    this.printRouteTable();
    Container.get(HttpServerAdapter).registerControllers(
      this.registeredControllers
    );
  }

  async start() {
    await Container.get(HttpServerAdapter).listen(
      config("app.port"),
      config("app.host")
    );
    this.logger.log("info", `Server running at port: ${config("app.port")}`);
  }
}
