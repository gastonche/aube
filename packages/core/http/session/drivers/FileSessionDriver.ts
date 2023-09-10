import SessionDriver from "./SessionDriver";
import { readFile, unlink, writeFile, rmdir } from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import { SessionInterface } from "../types";
import { config } from "../../../helpers";
import { rootPath } from "../../../helpers/loader";

export default class FileSessionDriver extends SessionDriver {
  private getPath(id?: string) {
    return rootPath(config("session.files"), id ? `${id}.session` : "");
  }

  private readFile<T extends Object = SessionInterface>(
    id: string
  ): Promise<T | undefined> {
    return readFile(this.getPath(id))
      .then((file) => JSON.parse(file.toString()))
      .catch(() => undefined);
  }

  private writeFile<T extends object>(id: string, data: T) {
    if (!existsSync(this.getPath())) {
      try {
        mkdirSync(this.getPath(), { recursive: true });
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return writeFile(this.getPath(id), JSON.stringify(data, undefined, 4));
  }

  private loadAllFile(): Promise<Record<string, boolean>> {
    return this.readFile<Record<string, boolean>>("all").then(file => file ?? {});
  }

  private writeAllFile(data: Record<string, boolean>): void {
    this.writeFile("all", data);
  }

  all() {
    return this.loadAllFile()
      .then((sessions) =>
        Promise.all(Object.keys(sessions).map((id) => this.readFile(id)))
      )
      .then((sessions) => sessions.filter(Boolean) as SessionInterface[]);
  }

  get(id: string) {
    return this.readFile(id);
  }

  destroy(id: string) {
    return unlink(this.getPath(id))
      .then(this.loadAllFile)
      .then((sessions) => {
        delete sessions[id];
        return this.writeAllFile(sessions);
      });
  }

  clear() {
    return rmdir(this.getPath());
  }

  length() {
    return this.loadAllFile().then(file => Object.keys(file).length)
  }

  set(id: string, value: SessionInterface) {
    return this.writeFile(id, value)
      .then(this.loadAllFile.bind(this))
      .then((sessions) => {
        sessions[id] = true;
        return this.writeAllFile(sessions);
      });
  }
}
