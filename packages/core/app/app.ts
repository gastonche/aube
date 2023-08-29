import Container from "typedi";
import { config } from "../helpers";
import { Constructable } from "../http/types";
import Kernel from "../kernel";
import { ApplicationOptions } from "./types";
import Provider from "../providers/Provider";

const SERVER_STARTED_LABEL = "Server started in";

export default class Application {
  private providers: Provider[] = [];

  constructor(private options: ApplicationOptions) {
    console.time(SERVER_STARTED_LABEL);
    const Kernel = this.getHttpKernel();
    this.providers = this.initProviders(new Kernel());
  }

  getHttpKernel() {
    return Kernel;
  }

  initProviders(kernel: Kernel) {
    const providers = config("app.providers", []) as Constructable<Provider>[];
    return providers.map((Provider) => {
      const provider = new Provider(kernel, this.options);
      Container.set(Provider, provider);
      provider.boot();
      return provider;
    });
  }

  start() {
    this.providers.forEach((provider) => provider.start?.());
    console.timeEnd(SERVER_STARTED_LABEL);
  }
}
