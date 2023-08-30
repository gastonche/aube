import { Server } from "http";
import { HttpController, HttpServerAdapterInterface } from "./types";

export default class HttpServerAdapter implements HttpServerAdapterInterface {
  listen(port: number, host?: string | undefined): Promise<Server> {
    return Promise.reject("Server not running");
  }
  registerControllers(controllers: HttpController[]) {}
}
