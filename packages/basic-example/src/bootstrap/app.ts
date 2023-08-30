import { AubeApplication, BaseHttpKernel, Container } from "@aube/core";
import HttpKernel from "../app/http/kernel";

export default class Application extends AubeApplication {
  register() {
    Container.register(BaseHttpKernel, HttpKernel);
  }
}
