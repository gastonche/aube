import {BaseKernel} from "@aube/core";
import { MiddlewareDefinition, MiddlewarePrototype } from "@aube/core/http/middleware/types";
import RequestLoggerMiddleware from "./middlewares/logger.middleware";

export default class Kernel extends BaseKernel {
    get globalMiddlewares(): MiddlewareDefinition[] {
        return [RequestLoggerMiddleware];
      }
    
      get middlewareGroups(): Record<string, MiddlewareDefinition[]> {
        return {};
      }
    
      get middlewareMapping(): Record<string, MiddlewarePrototype> {
        return {};
      }
    
      get middlewarePriority(): MiddlewareDefinition[] {
        return [];
      }
}