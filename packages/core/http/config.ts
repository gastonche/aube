import { join } from "path";
import { Request, Response } from "express";
import { Constructable, RouteOptions } from "./types";
import { CONTROLLER_DEFINITIONS, ROUTE_DEFINITIONS } from "../constants";
import { Logger } from "../logger";
import { config } from "../helpers";
import { loadFiles } from "../helpers/loader";
import Kernel from "../app/kernel";
import {
  applyMiddlewares,
  createExecuteMethodMiddleware,
  terminateMiddleware,
} from "./middleware/handle";
import { ControllerMethod, HttpController } from "./adapters/types";

export default class RoutingConfig {
  logger = new Logger(`${config("app.name")} > server router`);

  constructor(public kernel: Kernel) {}

  get controllers() {
    return loadFiles("app/http/controllers/**/*.controller.ts").map(
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
    req: Request,
    res: Response
  ) {
    const middlewares = [
      ...this.kernel.getMiddlewares(controller, route.propertyKey),
      createExecuteMethodMiddleware(res),
    ];
    res.once("finish", () =>
      terminateMiddleware(controller, route.propertyKey, req, res, middlewares)
    );
    try {
      const result = await applyMiddlewares(
        req,
        controller,
        route.propertyKey,
        middlewares
      );
      res.send(result);
    } catch (error) {
      this.logger.trace(error);
      res.status(500).send(error);
    }
  }
}
