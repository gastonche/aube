import SessionDriver from "./SessionDriver";
import { join } from "path";
import { readFileSync, unlinkSync, writeFileSync, rmSync } from "fs";
import { SessionInterface } from "../types";
import { config } from "../../../helpers";

export default class FileSessionDriver extends SessionDriver {
  private getPath(id: string) {
    return join(config("session.files"), `${id}.session`);
  }

  private readFile<T extends Object = SessionInterface>(
    id: string
  ): T | undefined {
    try {
      const file = readFileSync(this.getPath(id)).toString();
      if (file) {
        return JSON.parse(file);
      }
    } catch (e) {}

    return undefined;
  }

  private writeFile<T extends object>(id: string, data: T) {
    writeFileSync(this.getPath(id), JSON.stringify(data, undefined, 4));
  }

  private loadAllFile(): Record<string, boolean> {
    return this.readFile<Record<string, boolean>>("all") ?? {};
  }

  private writeAllFile(data: Record<string, boolean>): void {
    this.writeFile("all", data);
  }

  private toPromise<T>(fn: () => T) {
    try {
      return Promise.resolve(fn());
    } catch (e) {
      console.log(e);
      return Promise.reject(e);
    }
  }

  all() {
    return this.toPromise(() => {
      const sessions = this.loadAllFile();
      return Promise.resolve(
        Object.keys(sessions)
          .map((id) => this.readFile(id))
          .filter(Boolean) as SessionInterface[]
      );
    });
  }

  get(id: string) {
    return this.toPromise(() => this.readFile(id));
  }

  destroy(id: string) {
    return this.toPromise(() => {
      unlinkSync(this.getPath(id));
      const sessions = this.loadAllFile();
      delete sessions[id];
      this.writeAllFile(sessions);
      return Promise.resolve();
    });
  }

  clear() {
    return this.toPromise(() => {
      rmSync(config("session.files"), { recursive: true, force: true });
    });
  }

  length() {
    return this.toPromise(() => Object.keys(this.loadAllFile()).length);
  }

  set(id: string, value: SessionInterface) {
    return this.toPromise(() => {
      this.writeFile(id, value);
      const sessions = this.loadAllFile();
      sessions[id] = true;
      this.writeAllFile(sessions);
    });
  }
}
