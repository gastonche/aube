import { response } from "../../helpers";
import { Response } from "../../http";

export interface AubeErrorInterface extends Error {
  name: string;
  prototype: ReturnType<typeof Object.getPrototypeOf>;
  context: () => Record<string, any>;
  report?: () => boolean | void;
  render?: () => Response;
}

export default class AubeError extends Error implements AubeErrorInterface {
  constructor(public message: string) {
    super(message);
  }

  get prototype() {
    return Object.getPrototypeOf(this);
  }

  get name(): string {
    return this.prototype.name;
  }

  context(): Record<string, any> {
    return {};
  }

  report(): boolean | void {
    return true;
  }

  render() {
    return response(this);
  }
}
