import { MiddlewareInterface, MiddlewareNext, Request } from "../../http";
import { getErrorHandler } from "./ErrorHandler";

export default class ErrorHandlerMiddleware implements MiddlewareInterface {
  handle(request: Request<any>, next: MiddlewareNext<unknown>) {
    return next(request).catch((error: Error) => {
      const handler = getErrorHandler();
      handler.report(error);
      return handler.render(error, request);
    });
  }
}
