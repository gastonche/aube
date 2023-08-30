import { Controller, Get, Params, Query, WithMiddleware, abort } from "@aube/core";

@Controller()
export default class IndexController {
  @WithMiddleware("ip:100")
  @Get()
  home(@Query() query: any) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(query), 2000);
    });
  }

  @Get("/:id/name")
  getParams(@Params() params: any) {
    return abort(400);
  }
}
