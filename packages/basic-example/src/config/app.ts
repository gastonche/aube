import { env } from "@aube/core";

export default {
    name: env("APP_NAME", "Sample App"),
    port: env("PORT", 9001)
}