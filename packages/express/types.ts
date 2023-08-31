import { json, static as expressStatic, urlencoded } from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import session from "express-session";

export interface Options {
  middleware?: {
    json?: false | Parameters<typeof json>[0];
    static?:
      | false
      | {
          root?: Parameters<typeof expressStatic>[0];
          options?: Parameters<typeof expressStatic>[1];
        };
    urlencoded?: false | Parameters<typeof urlencoded>[0];
    helmet?: false | Parameters<typeof helmet>[0];
    cookies?: Parameters<typeof cookieParser>[1];
    session?: Omit<Parameters<typeof session>[0], "secret">;
  };
}
