import { BaseKernel } from "../http";
import { AubeApplication } from "../app";

export default class Provider {
  constructor(
    protected kernel: BaseKernel,
    protected app: AubeApplication
  ) {}
  boot() {}
  start() {}
}
