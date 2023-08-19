import { loadFiles } from "./loader";
import get from "lodash.get";

interface Configs {
  loaded: boolean;
  configs: Record<string, string | boolean | number>;
}

const data: Configs = {
  loaded: false,
  configs: {},
};

function loadConfigs() {
  const conf = loadFiles("config/*.ts").reduce((acc, { file, path }) => {
    const key = path.split("/").pop()?.split(".").shift() as string;
    return { ...acc, [key]: file.default };
  }, {} as Configs["configs"]);

  data.loaded = true;
  data.configs = conf;
}

export function config<T>(key: string, defaultValue?: T): T {
  if (!data.loaded) {
    loadConfigs();
  }
  return get(data.configs, key, defaultValue) as T;
}
