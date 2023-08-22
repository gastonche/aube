import { join } from "path";
import { Application, Request, Response, Router } from "express";
import {
  Constructable,
  HttpMethodParamDecoratorGetter,
  RouteOptions,
} from "./types";
import {
  CONTROLLER_DEFINITIONS,
  ROUTE_DEFINITIONS,
  getControllerMethodParamInjectorName,
} from "../constants";
import Container from "typedi";
import { Logger } from "../logger";
import { config } from "../helpers";
import { loadFiles } from "../helpers/loader";
import Kernel from "../app/kernel";
import { RouteTable } from "./route-table";
import { applyMiddlewares } from "./middleware/utils";
import { createExecuteMethodMiddleware } from "./middleware/execute";

interface RoutesTableRoute {
  controller: string;
  path: string;
  method: string;
}

export default class ServerRouter {
  logger = new Logger(`${config("app.name")} > server router`);
  table = new RouteTable();

  constructor(public app: Application, public kernel: Kernel) {
    this.registerControllers(this.loadControllers());
  }

  private loadControllers() {
    return loadFiles("app/http/controllers/**/*.controller.ts").map(
      ({ file }) => file.default
    );
  }

  registerControllers(controllers: Constructable[]) {
    controllers.forEach((controller) => {
      const { paths } = Reflect.getMetadata(CONTROLLER_DEFINITIONS, controller);
      const roots = Array.isArray(paths)
        ? (paths as string[])
        : [paths as string];
      const router = this.registerController(controller, roots);
      roots.forEach((path) => this.app.use(path, router));
    });
    this.table.print();
    this.table.clear();
  }

  private registerController(controller: Constructable, roots: string[]) {
    const router = Router();
    const routes: (RouteOptions & { propertyKey: string })[] =
      Reflect.getMetadata(ROUTE_DEFINITIONS, controller) ?? [];
    routes.forEach((option) => {
      this.table.registerControllerRoute(roots, option, controller);
      router[option.method](option.path, async (req, res) => {
        try {
          const result = await applyMiddlewares(
            req,
            controller,
            option.propertyKey,
            ...this.kernel.getMiddlewares(controller, option.propertyKey),
            createExecuteMethodMiddleware(res)
          );
          res.send(result);
        } catch (error) {
          this.logger.trace(error);
          res.status(500).send(error);
        }
      });
    });
    return router;
  }
}
