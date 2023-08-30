import { Singleton, BaseErrorHandler } from "@aube/core";

@Singleton()
export default class ErrorHandler extends BaseErrorHandler {
  register(): void {}
}
