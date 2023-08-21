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

interface RoutesTableRoute {
  controller: string;
  path: string;
  method: string;
}

export default class ServerRouter {
  logger = new Logger(`${config("app.name")} > server router`);

  registerControllers(app: Application, controllers: Constructable[]) {
    let routeTable: RoutesTableRoute[] = [];
    controllers.forEach((controller) => {
      const { paths } = Reflect.getMetadata(CONTROLLER_DEFINITIONS, controller);
      const roots = Array.isArray(paths)
        ? (paths as string[])
        : [paths as string];
      const { router, routeSpecs } = this.registerController(controller);
      roots.forEach((path) => app.use(path, router));

      // Add routes for disply on all roots
      routeTable = routeTable.concat(
        roots.flatMap((root) =>
          routeSpecs.map((spec) => ({
            ...spec,
            path: join(root, spec.path),
          }))
        )
      );
    });
    console.table(routeTable);
  }

  private registerController(controller: Constructable) {
    const router = Router();
    const routes: (RouteOptions & { propertyKey: string })[] =
      Reflect.getMetadata(ROUTE_DEFINITIONS, controller) ?? [];
    const routeSpecs: RoutesTableRoute[] = [];
    routes.forEach((option) => {
      // Register route for atble display
      routeSpecs.push({
        controller: `${controller.name}@${option.propertyKey}`,
        method: option.method,
        path: option.path,
      });

      router[option.method](option.path, async (req, res) => {
        try {
          const result = await this.callMethod(controller, option, req, res);
          res.send(result);
        } catch (error) {
          this.logger.error(error);
          res.status(500).send(error);
        }
      });
    });
    return { router, routeSpecs };
  }

  callMethod(
    controller: Constructable,
    options: RouteOptions & { propertyKey: string },
    req: Request,
    res: Response
  ) {
    const getters: HttpMethodParamDecoratorGetter[] =
      Reflect.getMetadata(
        getControllerMethodParamInjectorName(options.propertyKey),
        controller.prototype
      ) ?? [];

    const params = Reflect.getMetadata(
      "design:paramtypes",
      controller.prototype,
      options.propertyKey
    ).map((_: unknown, i: number) => getters[i]);
    if (!params.every(Boolean)) {
      throw Error(
        `Can't find injected value for some params of ${options.propertyKey}`
      );
    }
    return Container.get(controller)[options.propertyKey](
      ...params.map((getter: HttpMethodParamDecoratorGetter) =>
        getter(req, res)
      )
    );
  }
}
