import { config } from "../helpers";
import { Constructable } from "../http/types";
import Kernel from "./kernel/kernel";
import { ApplicationOptions } from "./types";
import Provider from "../providers/Provider";
import { Container } from "../injector";
import HttpKernel from "./kernel/httpKernel";

const SERVER_STARTED_LABEL = "Server started in";

export default class Application {
  private providers: Provider[] = [];

  constructor(private options: ApplicationOptions) {
    console.time(SERVER_STARTED_LABEL);
    this.register();
    this.providers = this.initProviders(Container.get(HttpKernel));
  }

  initProviders(kernel: Kernel) {
    const providers = config("app.providers", []) as Constructable<Provider>[];
    return providers.map((Provider) => {
      const provider = new Provider(kernel, this.options);
      provider.boot();
      return provider;
    });
  }

  start() {
    this.providers.forEach((provider) => provider.start?.());
    console.timeEnd(SERVER_STARTED_LABEL);
  }

  protected register() {}
}
