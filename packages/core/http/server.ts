import express from "express";
import { loadFiles } from "../helpers/loader";
import ServerRouter from "./server-router";

export class HttpServer {
  app = express();
  router = new ServerRouter();

  private loadControllers() {
    return loadFiles("app/http/controllers/**/*.controller.ts").map(
      ({ file }) => file.default
    );
  }

  registerControllers() {
    this.router.registerControllers(this.app, this.loadControllers());
  }

  listen(port: number, hostname = "") {
    return new Promise((resolve) => {
      const server = this.app.listen(port, hostname, () => {
        resolve(server);
      });
    });
  }
}
