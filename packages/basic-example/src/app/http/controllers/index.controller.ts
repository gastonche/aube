import {
  Controller,
  Get,
  Params,
  Query,
  WithMiddleware,
  request,
  response,
} from "@aube/core";

@Controller()
export default class IndexController {
  @WithMiddleware("ip:100", "logger")
  @Get()
  home(@Query() query: any) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(query), 2000);
    });
  }

  @Get("/:id/name")
  getParams(@Params() params: any) {
    return response({
      params,
      cookie: request().cookie("user"),
      secret: (request().originalRequest as any)?.secret,
    }).cookie("user", { name: "gaston" });
  }
}
