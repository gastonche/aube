import Session from "./Session";
import FileSessionDriver from "./drivers/FileSessionDriver";

Session.extend("file", () => new FileSessionDriver());

export { SessionInterface } from "./types";
export { default as InitializeSessionMiddleware } from "./InitializeSessionMiddleware";
export { Session };
