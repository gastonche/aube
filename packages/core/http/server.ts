import express, { Router } from "express";
import { loadFiles } from "../helpers/loader";
import {
  CONTROLLER_DEFINITIONS,
  REQUEST_DEFINITION,
  ROUTE_DEFINITIONS,
} from "../constants";
import { Constructable, RouteOptions } from "./types";
import { Container } from "../injector";

export class HttpServer {
  app = express();

  private loadControllers() {
    const files = loadFiles("app/http/controllers/**/*.controller.ts").map(
      ({ file }) => file.default
    );
    return files;
  }

  registerControllers() {
    const controllers = this.loadControllers();
    controllers.forEach((controller) => {
      const { paths } = Reflect.getMetadata(CONTROLLER_DEFINITIONS, controller);
      const roots = Array.isArray(paths)
        ? (paths as string[])
        : [paths as string];
      const router = this.registerController(controller);
      roots.forEach((path) => this.app.use(path, router));
    });
  }

  private registerController(controller: Constructable) {
    const router = Router();
    const routes = Reflect.getMetadata(ROUTE_DEFINITIONS, controller) ?? [];
    routes.forEach((route: RouteOptions & { propertyKey: string }) =>
      this.registerRoute(router, route, controller)
    );
    return router;
  }

  registerRoute(
    router: Router,
    options: RouteOptions & { propertyKey: string },
    controller: Constructable
  ) {
    router.use(async (req, res) => {
      Reflect.defineMetadata(REQUEST_DEFINITION, req, controller);
      const result = await Container.get(controller)[options.propertyKey]();
      res.send(result);
    });
  }

  listen(port: number) {
    this.app.listen(port);
  }
}
