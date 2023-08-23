import { Controller, Get, Params, Query, WithMiddleware } from "@aube/core";

@Controller()
export default class IndexController {
  @WithMiddleware("ip:99")
  @Get()
  home(@Query() query: any) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(query), 2000);
    });
  }

  @Get("/:id/name")
  getParams(@Params() params: any) {
    return params;
  }
}
