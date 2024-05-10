import { App } from "@slack/bolt";
import testCallback from "./test";
import imagineCallback from "./imagine";
import { debug } from "../../constants";

function prefixCommand(command: string): string {
  return debug ? `${command}-dev` : command;
}

function register(app: App) {
  app.command(prefixCommand("/test"), testCallback);
  app.command(prefixCommand("/imagine"), imagineCallback);
}

export default { register };
