import { AubeError } from "../../app";
import { config } from "../../helpers";
import { Container } from "../../injector";
import Request from "../request";
import SessionDriver from "./drivers/SessionDriver";
import { SessionInterface } from "./types";

type SessionDriverFactory = () => SessionDriver;
export interface HttpSession {
  id: string;
  [k: string]: any;
  regenerate(callback: (err: any) => void): this;

  destroy(callback: (err: any) => void): this;

  reload(callback: (err: any) => void): this;

  resetMaxAge(): this;

  save(callback?: (err: any) => void): this;

  touch(): this;
}

const noop = () => {};

const sessionDrivers: Record<string, SessionDriverFactory> = {};

export default class Session implements Omit<SessionInterface, "payload"> {
  private session: HttpSession;
  constructor(req: Request) {
    this.session = req.originalRequest.session;
    this.session.ip = req.ip;
    this.session.user_agent = req.header("user-agent");
    this.session.last_activity = Date.now();
    if (!this.session.payload) this.session.payload = {};
  }

  get<T>(key: string, defaultValue?: T) {
    return this.session.payload[key] ?? defaultValue;
  }

  all() {
    return this.session.payload;
  }

  has(key: string) {
    return Object.keys(this.all()).includes(key);
  }

  missing(key: string) {
    return !this.has(key);
  }

  forget(key: string) {
    delete this.session.payload[key];
    return this;
  }

  flush() {
    this.session.payload = {};
    return this;
  }

  pull<T>(key: string, defaultValue?: T): T {
    const value = this.get(key, defaultValue);
    return value;
  }

  set(key: string, value: any) {
    this.session.payload[key] = value;
    return this;
  }

  get id() {
    return this.session.id;
  }

  get ip_address() {
    return this.session.ip_address;
  }

  get user_agent() {
    return this.session.user_agent;
  }

  get last_activity() {
    return this.session.user_agent;
  }

  regenerate(callback: (err: any) => void = noop) {
    this.session.regenerate(callback);
    return this;
  }

  invalidate(callback: (err: any) => void = noop) {
    this.flush();
    this.regenerate(callback);
  }

  destroy(callback: (err: any) => void = noop) {
    this.session.destroy(callback);
    return this;
  }

  reload(callback: (err: any) => void = noop) {
    this.session.reload(callback);
    return this;
  }

  resetMaxAge() {
    this.session.resetMaxAge();
    return this;
  }

  save(callback?: (err: any) => void): this {
    this.session.save(callback);
    return this;
  }

  touch() {
    this.session.touch();
    return this;
  }

  public static extend(name: string, factory: SessionDriverFactory) {
    sessionDrivers[name] = factory;
  }

  public static driver() {
    try {
      return Container.get(SessionDriver);
    } catch {
      const factory = sessionDrivers[config<string>("session.driver")];
      if (!factory) {
        throw new AubeError(
          "Unable to initialize session. Invalid session driver"
        );
      }
      Container.set(SessionDriver, factory());
      return Container.get(SessionDriver);
    }
  }
}
