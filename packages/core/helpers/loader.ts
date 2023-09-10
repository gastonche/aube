import { globSync } from "glob";
import path from "path";

export function rootPath(...filePath: string[]) {
  return path.join(process.cwd(), ...filePath);
}

export function loadFiles(filePath: string) {
  filePath = rootPath("src", filePath);
  return globSync(filePath).map((file) => ({
    file: require(file),
    path: file,
  }));
}
