import { Controller, Get, Params } from "@aube/core";

@Controller()
export default class IndexController {
  @Get()
  home(@Params() params: any) {
    console.log({params})
    return { name: "json", params };
  }
}
