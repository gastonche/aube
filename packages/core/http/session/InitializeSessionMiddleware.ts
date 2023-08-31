import { Container } from "../../injector";
import { MiddlewareInterface, MiddlewareNext } from "../middleware";
import Request from "../request";
import Session from "./Session";

export default class InitializeSessionMiddleware
  implements MiddlewareInterface
{
  async handle(request: Request<any>, next: MiddlewareNext<unknown>) {
    const session = new Session(request);
    Container.set(Session, session);
    const res = await next(request);
    session.save();
    return res;
  }
}
