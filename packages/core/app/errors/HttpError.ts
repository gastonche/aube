import { response } from "../../helpers";
import AubeError from "./AubeError";
import { HttpStatusCode, getHttpMessage } from "./messages";

export default class HttpError extends AubeError {
  constructor(public status: HttpStatusCode, message = getHttpMessage(status)) {
    super(message);
  }

  report(): void {}

  render() {
    return response(this, this.status);
  }
}
