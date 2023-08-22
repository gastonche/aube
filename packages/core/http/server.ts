import express from "express";
import ServerRouter from "./server-router";
import Kernel from "../app/kernel";

export class HttpServer extends ServerRouter {
  constructor(kernel: Kernel) {
    super(express(), kernel);
  }

  listen(port: number, hostname = "") {
    return new Promise((resolve) => {
      const server = this.app.listen(port, hostname, () => {
        resolve(server);
      });
    });
  }
}
