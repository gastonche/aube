import { BaseErrorHandler, Container, Singleton } from "@aube/core";
import ErrorHandler from "../app/errors/Handler";

@Singleton()
export default class AppProvider {
  boot() {
    Container.register(BaseErrorHandler, ErrorHandler);
  }
}
