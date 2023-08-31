import { SessionInterface } from "../types";

export default class SessionDriver {
  all(): Promise<SessionInterface[]> {
    return Promise.resolve([]);
  }

  get(id: string): Promise<SessionInterface | undefined> {
    return Promise.resolve(undefined);
  }
  destroy(id: string): Promise<void> {
    return Promise.reject();
  }
  clear(): Promise<void> {
    return Promise.reject();
  }
  length() {
    return Promise.resolve(0);
  }
  set(id: string, session: SessionInterface): Promise<void> {
    return Promise.reject();
  }
}
