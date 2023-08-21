import { Controller, Get, Params } from "@aube/core";

@Controller()
export default class IndexController {
  @Get()
  home(@Params() params: any) {
    return { name: "json", params };
  }
}
