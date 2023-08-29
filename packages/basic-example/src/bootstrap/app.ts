import { AubeApplication } from "@aube/core";
import HttpKernel from "../app/http/kernel";

export default class Application extends AubeApplication {
  getHttpKernel() {
    return HttpKernel;
  }
}
