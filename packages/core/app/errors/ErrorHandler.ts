import { response } from "../../helpers";
import { Request } from "../../http";
import { Constructable } from "../../http/types";
import { Container } from "../../injector";
import { Logger } from "../../logger";
import AubeError from "./AubeError";

export default class BaseErrorHandler {
  private logger = new Logger("Error Handler");
  public isRegistered = false;

  private reporters: WeakMap<
    Constructable<AubeError>,
    (e: AubeError) => boolean
  > = new WeakMap();
  private renderers: WeakMap<
    Constructable<AubeError>,
    (e: AubeError, request: Request) => boolean
  > = new WeakMap();

  protected dontReport: Constructable<AubeError>[] = [];

  protected context(): Record<string, any> {
    return {};
  }

  registered() {
    this.isRegistered = true;
  }

  public report(error: Error) {
    let log: boolean | void = true;
    let context = this.context();
    if (error instanceof AubeError) {
      if (!this.dontReport.includes(error.prototype)) {
        if (this.reporters.has(error.prototype)) {
          log = this.reporters.get(error.prototype)?.(error);
        } else {
          log = error.report();
        }
      }
      context = { ...context, ...error.context() };
    }

    if (log === true || log === undefined) {
      this.logger.error(JSON.stringify({ error, context, stack: error.stack }));
    }
  }

  protected reportable(
    error: Constructable<AubeError>,
    fn: (e: AubeError) => boolean
  ) {
    this.reporters.set(error, fn);
  }

  protected renderable(
    error: Constructable<AubeError>,
    fn: (e: AubeError) => boolean
  ) {
    this.renderers.set(error, fn);
  }

  protected stopReporting(error: Constructable<AubeError>) {
    this.dontReport.push(error);
  }

  public render(error: Error, request: Request) {
    if (error instanceof AubeError) {
      if (this.renderers.has(error.prototype)) {
        return this.renderers.get(error.prototype)?.(error, request);
      }
      return error.render();
    }
    return response(error, 500);
  }

  register() {}
}

export function getErrorHandler() {
  const handler = Container.get(BaseErrorHandler);
  if (!handler.isRegistered) {
    handler.register();
  }
  return handler;
}
