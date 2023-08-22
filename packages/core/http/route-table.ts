import { Constructable, HttpMethod, RouteOptions } from "./types";
import { join } from "path";

export class RouteTable {
  private routes: {
    controller: string;
    path: string;
    method: string;
  }[] = [];

  clear() {
    this.routes = [];
  }

  registerControllerRoute(
    paths: string | string[],
    { method, path, propertyKey }: RouteOptions & { propertyKey: string },
    controller: Constructable
  ) {
    const roots = Array.isArray(paths) ? paths : [paths];
    this.routes = this.routes.concat(
      roots.map((root) => ({
        controller: `${controller.name}@${propertyKey}`,
        method,
        path: join("/", root, "/", path),
      }))
    );
  }

  print() {
    console.table(this.routes);
  }
}
