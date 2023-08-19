import { config } from "dotenv";

config();

export function env(key: string, defaultValue: string | number | boolean) {
    return process.env[key] ?? defaultValue;
}
