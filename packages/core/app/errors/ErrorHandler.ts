import { response } from "../../helpers";
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

  protected dontReport: Constructable<AubeError>[] = [];

  protected context(): Record<string, any> {
    return {};
  }

  registered() {
    this.isRegistered = true;
  }

  handle(error: Error) {
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
    } else {
      log = this.report(error);
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

  protected stopReporting(error: Constructable<AubeError>) {
    this.dontReport.push(error);
  }

  register() {}

  render(error: Error) {
    return response(error, 500);
  }

  report(error: Error) {
    return true;
  }
}

export function getErrorHandler() {
  const handler = Container.get(BaseErrorHandler);
  if (!handler.isRegistered) {
    handler.register();
  }
  return handler;
}
