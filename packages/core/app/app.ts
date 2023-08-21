import { config } from "../helpers";
import { HttpServer } from "../http/server";
import { ApplicationOptions } from "./app.types";

const SERVER_STARTED_LABEL = "Server started in";

export default class Application {
  httpServer: HttpServer = new HttpServer();

  constructor(options: ApplicationOptions = {}) {
    console.time(SERVER_STARTED_LABEL);
    this.httpServer.registerControllers();
  }

  start() {
    return this.httpServer
      .listen(config("app.port"), config("app.host"))
      .then((res) => {
        console.timeEnd(SERVER_STARTED_LABEL);
        return res;
      });
  }
}
