export default class ErrorHandler {
  handle(error: Error) {
    console.log(error.stack);
    return {
      status: 500,
      error,
    };
  }
}
