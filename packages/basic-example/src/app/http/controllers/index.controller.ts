import { Controller, Get, Inject } from "@aube/core";
import SampleClass from "./sample.class";

@Controller()
export default class IndexController {
    @Inject()
    sampleClass: SampleClass;
  @Get("/")
  home() {
    return { name: "json" };
  }
}
