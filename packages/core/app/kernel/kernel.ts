import {
  DetailedMiddlewareDefinition,
  MiddlewareDefinition,
  MiddlewareClass,
} from "../../http/middleware/types";
import {
  getExcludedMiddlewares,
  getIncludedMiddlewares,
} from "../../http/middleware/utils";
import { Constructable } from "../../http/types";

interface BaseKernelType {
  globalMiddlewares: MiddlewareDefinition[];
  middlewareGroups: Record<string, MiddlewareDefinition[]>;
  middlewareMapping: Record<string, MiddlewareClass>;
  middlewarePriority: MiddlewareDefinition[];
}

export default class Kernel implements BaseKernelType {
  get globalMiddlewares(): MiddlewareDefinition[] {
    return [];
  }

  get middlewareGroups(): Record<string, MiddlewareDefinition[]> {
    return {};
  }

  get middlewareMapping(): Record<string, MiddlewareClass> {
    return {};
  }

  get middlewarePriority(): MiddlewareClass[] {
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

  private sorter(
    a: DetailedMiddlewareDefinition,
    b: DetailedMiddlewareDefinition
  ) {
    const aIndex = this.middlewarePriority.includes(a.handler)
      ? this.middlewarePriority.indexOf(a.handler)
      : this.middlewarePriority.length;
    const bIndex = this.middlewarePriority.includes(b.handler)
      ? this.middlewarePriority.indexOf(b.handler)
      : this.middlewarePriority.length;

    return aIndex > bIndex ? 1 : -1;
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
    ).sort(this.sorter.bind(this));
  }
}
