import { AubeError } from "../../app";
import { config } from "../../helpers";
import { Container } from "../../injector";
import Request from "../request";
import SessionDriver from "./drivers/SessionDriver";
import { SessionInterface } from "./types";

type SessionDriverFactory = () => SessionDriver;
type SessionGetKey = keyof SessionInterface;

export interface HttpSession {
  id: string;

  cookie: { maxAge?: number };

  set: <T = any>(key: SessionGetKey, value: T) => void;

  get: <T = any>(key: SessionGetKey) => T | undefined;

  regenerate(callback: (err: any) => void): void;

  destroy(callback: (err: any) => void): void;

  reload(callback: (err: any) => void): void;

  save(callback?: (err: any) => void): void;

  touch(): void;
}

const noop = () => {};

const sessionDrivers: Record<string, SessionDriverFactory> = {};

export default class Session implements Omit<SessionInterface, "payload"> {
  private session: HttpSession;
  constructor(req: Request) {
    this.session = req.httpSession;
    this.session.set("userAgent", req.header("user-agent"));
    this.session.set("lastActivity", Date.now());
    this.session.set("ip", req.ip);
    this.session.set("payload", this.session.get("payload") ?? {});
  }

  get<T>(key: string, defaultValue?: T) {
    return this.session.get("payload")?.[key] ?? defaultValue;
  }

  all() {
    return this.session.get("payload");
  }

  has(key: string) {
    return Object.keys(this.all()).includes(key);
  }

  missing(key: string) {
    return !this.has(key);
  }

  forget(key: string) {
    const payload = this.all() ?? {};
    delete payload[key];
    this.session.set("payload", payload);
    return this;
  }

  flush() {
    this.session.set("payload", {});
    return this;
  }

  pull<T>(key: string, defaultValue?: T): T {
    const value = this.get(key, defaultValue);
    return value;
  }

  set(key: string, value: any) {
    const payload = { ...this.get(key), [key]: value };
    this.session.set("payload", payload);
    return this;
  }

  get id() {
    return this.session.id;
  }

  get ip() {
    return this.session.get("ip");
  }

  get userAgent() {
    return this.session.get("userAgent");
  }

  get lastActivity() {
    return this.session.get("lastActivity");
  }

  regenerate(callback: (err: any) => void = noop) {
    this.session.regenerate(callback);
    return this;
  }

  invalidate(callback: (err: any) => void = noop) {
    this.flush();
    this.regenerate(callback);
  }

  reload(callback: (err: any) => void = noop) {
    this.session.reload(callback);
    return this;
  }

  resetMaxAge() {
    this.session.cookie.maxAge = config<number>("session.lifetime") * 60;
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
