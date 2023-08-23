import { HttpController } from "./types";
import express, { Router } from "express";

export default class ExpressHttpAdapter {
  app = express();

  registerControllers(controllers: HttpController[]) {
    controllers.forEach(({ prefixes, methods }) => {
      const router = Router();
      prefixes.forEach((prefix) => this.app.use(prefix, router));
      methods.forEach(({ method, handler, path }) => {
        router[method]?.(path, handler);
      });
    });
  }
}
