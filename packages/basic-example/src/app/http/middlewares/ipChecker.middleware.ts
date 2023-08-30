import {
  MiddlewareClass,
  MiddlewareNext,
  Request,
  Response,
  Singleton,
  abort,
} from "@aube/core";
@Singleton()
export default class IpCheckerMiddleware implements MiddlewareClass {
  handle(request: Request, next: MiddlewareNext<unknown>, value: number) {
    if (request.query<number>("ip") === value) {
      return next(request);
    }
    abort(401);
  }

  terminate(request: Request, response: Response) {
    console.log(request.path);
  }
}
