import { Session } from "@aube/core";
import { Store } from "express-session";

export default class SessionStore extends Store {
  private get driver() {
    return Session.driver();
  }

  all(callback: (error?: Error, data?: any[]) => void) {
    this.driver
      .all()
      .then((sessions) => callback(undefined, sessions))
      .catch((error) => callback(error));
  }
  get(id: string, cb: (error?: Error, data?: any) => void) {
    this.driver
      .get(id)
      .then((session) => cb(undefined, session))
      .catch((error) => cb(error));
  }
  destroy(id: string, cb: (error?: Error) => void) {
    this.driver.destroy(id).catch((error) => cb(error));
  }
  clear(cb: (error?: Error) => void) {
    this.driver.clear().catch((error) => cb(error));
  }
  length(cb: (error?: Error, len?: number) => void) {
    this.driver
      .length()
      .then((len) => cb(undefined, len))
      .catch((error) => cb(error));
  }

  async set(id: string, session: any, cb: (error?: Error) => void) {
    this.driver
      .set(id, session)
      .then(() => cb(undefined))
      .catch((error) => cb(error));
  }
  touch(id: string, value: any, cb: (error?: Error) => void) {
    this.set(id, value, cb);
  }
}
