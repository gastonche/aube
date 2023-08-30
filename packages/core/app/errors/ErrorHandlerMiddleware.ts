import { response } from "../../helpers";
import { MiddlewareClass, MiddlewareNext, Request } from "../../http";
import AubeError from "./AubeError";
import { getErrorHandler } from "./ErrorHandler";

export default class ErrorHandlerMiddleware implements MiddlewareClass {
  handle(request: Request<any>, next: MiddlewareNext<unknown>) {
    return next(request).catch((error: Error) => {
      const handler = getErrorHandler();
      handler.handle(error);
      return error instanceof AubeError
        ? error.render()
        : handler.render(error);
    });
  }
}
