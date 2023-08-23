import Kernel from "../app/kernel";
import ExpressHttpAdapter from "./adapters/express";
import RouteConfig from "./config";

export class HttpServer {
  adapter = new ExpressHttpAdapter();
  routingConfig: RouteConfig;

  constructor(kernel: Kernel) {
    this.routingConfig = new RouteConfig(kernel);
    this.adapter.registerControllers(this.routingConfig.registeredControllers);
    this.routingConfig.printRouteTable();
  }

  listen(port: number, hostname = "") {
    return new Promise((resolve) => {
      const server = this.adapter.app.listen(port, hostname, () => {
        resolve(server);
      });
    });
  }
}
