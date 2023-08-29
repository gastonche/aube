import {
  MiddlewareClass,
  MiddlewareNext,
  Request,
  Response,
  Service,
  response,
} from "@aube/core";
@Service()
export default class IpCheckerMiddleware implements MiddlewareClass {
  handle(request: Request, next: MiddlewareNext<unknown>, value: number) {
    if (request.query<number>("ip") === value) {
      return next(request);
    }

    return response().redirectTo("/1/name");
  }

  terminate(request: Request, response: Response) {
    console.log(request.path);
  }
}
