import { config } from "../helpers";
import { loadFiles } from "../helpers/loader";
import { HttpServer } from "../http/server";
import Kernel from "./kernel";
import { ApplicationOptions } from "./types";

const SERVER_STARTED_LABEL = "Server started in";

export default class Application {
  httpServer: HttpServer;

  constructor(options: ApplicationOptions = {}) {
    console.time(SERVER_STARTED_LABEL);
    this.httpServer = new HttpServer(this.loadKernel());
  }

  private loadKernel(): Kernel {
    const Kernel = loadFiles("app/http/kernel.ts").pop()?.file.default;
    return new Kernel();
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
