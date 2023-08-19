import { config } from "../helpers";
import { HttpServer } from "../http/server";
import { ApplicationOptions } from "./app.types";

export default class Application {
  httpServer: HttpServer = new HttpServer();

  constructor(options: ApplicationOptions = {}) {
    this.httpServer.registerControllers();
  }

  start() {
    this.httpServer.listen(config("app.port"));
  }
}
