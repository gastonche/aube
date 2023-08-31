import {
  BaseKernel,
  ErrorHandlerMiddleware,
  MiddlewareDefinition,
  MiddlewareClass,
  Singleton,
  InitializeSessionMiddleware,
} from "@aube/core";
import RequestLoggerMiddleware from "./middlewares/logger.middleware";
import IpCheckerMiddleware from "./middlewares/ipChecker.middleware";

@Singleton()
export default class HttpKernel extends BaseKernel {
  get globalMiddlewares(): MiddlewareDefinition[] {
    return [ErrorHandlerMiddleware, InitializeSessionMiddleware];
  }

  get middlewareGroups(): Record<string, MiddlewareDefinition[]> {
    return {};
  }

  get middlewareMapping(): Record<string, MiddlewareClass> {
    return {
      ip: IpCheckerMiddleware,
      logger: RequestLoggerMiddleware,
    };
  }

  get middlewarePriority(): MiddlewareClass[] {
    return [
      ErrorHandlerMiddleware,
      InitializeSessionMiddleware,
      RequestLoggerMiddleware,
    ];
  }
}
