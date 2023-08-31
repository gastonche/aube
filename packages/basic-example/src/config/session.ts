import { env } from "@aube/core";

export default {
  driver: env("SESSION_DRIVER", "file"),
  cookie: "aube.session",
  path: "/",
  domain: env("SESSION_DOMAIN"),
  secure: env("SESSION_SECURE_COOKIE", false),
  httpOnly: true,
  lifetime: 120,
  files: "storage/sessions"
};
