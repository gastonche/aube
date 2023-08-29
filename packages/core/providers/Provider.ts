import { BaseKernel } from "../http";
import { ApplicationOptions } from "../app";

export default class Provider {
  constructor(
    protected kernel: BaseKernel,
    protected options: ApplicationOptions
  ) {}
  boot() {}
  start() {}
}
