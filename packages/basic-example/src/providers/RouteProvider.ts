import { BaseRouteProvider } from "@aube/core";
import ErrorHandler from "../app/errors/Handler";

export default class RouteProvider extends BaseRouteProvider {
  getErrorHandler() {
    return ErrorHandler;
  }
}
