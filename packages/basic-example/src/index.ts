import ExpressHttpAdapter from "@aube/express";
import Application from "./bootstrap/app";

function bootstrap() {
  const app = new Application({
    adapter: new ExpressHttpAdapter(),
  });
  app.start();
}

bootstrap();
