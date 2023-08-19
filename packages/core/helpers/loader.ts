import { globSync } from "glob";
import path from "path";


export function loadFiles(filePath: string) {
    filePath = path.join(process.cwd(), "src", filePath);
    const files = globSync(filePath).map(file => ({file: require(file), path: file}));
    return files;
}