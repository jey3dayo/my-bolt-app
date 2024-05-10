import { App } from "@slack/bolt";
import testCallback from "./test";
import imagineCallback from "./imagine";
import { debug } from "../../constants";

function prefixCommand(command: string): string {
  return debug ? `${command}-dev` : command;
}

const commands = {
  "/test": testCallback,
  "/imagine": imagineCallback,
};

function register(app: App) {
  Object.keys(commands).forEach((cmd) => {
    app.command(prefixCommand(cmd), commands[cmd]);
  });
}

export default { register };
