import type { App } from "@slack/bolt";
import events from "./events";
import message from "./message";
import commands from "./commands";

function registerListeners(app: App) {
  events.register(app);
  message.register(app);
  commands.register(app);
}

export default registerListeners;
