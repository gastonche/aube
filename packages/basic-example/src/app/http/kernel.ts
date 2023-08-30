import {
  BaseKernel,
  ErrorHandlerMiddleware,
  MiddlewareDefinition,
  MiddlewarePrototype,
  Singleton,
} from "@aube/core";
import RequestLoggerMiddleware from "./middlewares/logger.middleware";
import IpCheckerMiddleware from "./middlewares/ipChecker.middleware";

@Singleton()
export default class HttpKernel extends BaseKernel {
  get globalMiddlewares(): MiddlewareDefinition[] {
    return [ErrorHandlerMiddleware, RequestLoggerMiddleware];
  }

  get middlewareGroups(): Record<string, MiddlewareDefinition[]> {
    return {};
  }

  get middlewareMapping(): Record<string, MiddlewarePrototype> {
    return {
      ip: IpCheckerMiddleware,
    };
  }

  get middlewarePriority(): MiddlewareDefinition[] {
    return [];
  }
}
