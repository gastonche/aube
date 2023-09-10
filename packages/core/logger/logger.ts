import fs from "fs";
import path from "path";
import { config } from "../helpers";
import { rootPath } from "../helpers/loader";

type LEVEL = "info" | "debug" | "trace" | "warn" | "error" | "fatal";

export class Logger {
  path: string;
  cache: any[] = [];

  constructor(
    private name: string,
    dir = config<string>("app.logsDir", "storage/logs"),
    private cacheSize = 100
  ) {
    dir = rootPath(dir);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    this.path = rootPath(
      dir,
      `${new Date().toISOString().replace(/:/gi, "-").split(".")[0]}-${
        this.name
      }.log`
    );
  }

  log(level: LEVEL, message: unknown) {
    const output = `${
      new Date().toISOString().replace("T", " ").split(".")[0]
    } \t ${this.name} \t ${level} \t ${message}`;
    console.log(output);
    this.cache.push(output);
    if (this.cache.length >= this.cacheSize) {
      fs.appendFileSync(this.path, this.cache.map((l) => `${l}\n`).join(""));
      this.cache = [];
    }
  }

  info = (message: unknown) => this.log("info", message);
  debug = (message: unknown) => this.log("debug", message);
  trace = (message: unknown) => this.log("trace", message);
  warn = (message: unknown) => this.log("warn", message);
  error = (message: unknown) => this.log("error", message);
  fatal = (message: unknown) => this.log("fatal", message);
}
