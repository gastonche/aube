import {
  DetailedMiddlewareDefinition,
  MiddlewareDefinition,
  MiddlewarePrototype,
} from "../../http/middleware/types";
import {
  getExcludedMiddlewares,
  getIncludedMiddlewares,
} from "../../http/middleware/utils";
import { Constructable } from "../../http/types";

interface BaseKernelType {
  globalMiddlewares: MiddlewareDefinition[];
  middlewareGroups: Record<string, MiddlewareDefinition[]>;
  middlewareMapping: Record<string, MiddlewarePrototype>;
  middlewarePriority: MiddlewareDefinition[];
}

export default class Kernel implements BaseKernelType {
  get globalMiddlewares(): MiddlewareDefinition[] {
    return [];
  }

  get middlewareGroups(): Record<string, MiddlewareDefinition[]> {
    return {};
  }

  get middlewareMapping(): Record<string, MiddlewarePrototype> {
    return {};
  }
  //   TODO: apply priority as specified;
  get middlewarePriority(): MiddlewareDefinition[] {
    return [];
  }

  parseMiddleware(
    middleware: MiddlewareDefinition
  ): DetailedMiddlewareDefinition | DetailedMiddlewareDefinition[] {
    if (typeof middleware === "string") {
      const [name, value] = middleware.trim().split(":");
      if (this.middlewareGroups[name]?.length) {
        return this.middlewareGroups[name]
          .flatMap(this.parseMiddleware.bind(this))
          .map((m) => ({ ...m, value: m.value ?? value }));
      }
      return {
        handler: this.middlewareMapping[name],
        value: value,
      };
    }

    if ("handler" in middleware) {
      return middleware;
    }

    return {
      handler: middleware,
    };
  }

  static getFinalMiddlewareList(
    included: DetailedMiddlewareDefinition[],
    excluded: DetailedMiddlewareDefinition[]
  ) {
    return included.filter(
      (middleware) =>
        middleware.handler &&
        excluded.every((m) => m.handler !== middleware.handler)
    );
  }

  getMiddlewares(controller: Constructable, propertyKey?: string | symbol) {
    const excluded = getExcludedMiddlewares(controller, propertyKey).flatMap(
      this.parseMiddleware
    );
    const included = getIncludedMiddlewares(controller, propertyKey).flatMap(
      this.parseMiddleware.bind(this)
    );
    return Kernel.getFinalMiddlewareList(
      [
        ...this.globalMiddlewares.flatMap(this.parseMiddleware.bind(this)),
        ...included,
      ],
      excluded
    );
  }
}
