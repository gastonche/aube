import { env } from "@aube/core";
import RouteProvider from "../providers/RouteProvider";
import AppProvider from "../providers/AppProviders";

export default {
    name: env("APP_NAME", "Sample App"),
    port: env("PORT", 9001),
    host: env("HOST"),
    providers: [AppProvider, RouteProvider],
    key: env("APP_KEY")
}