import { App } from "@slack/bolt";
import events from "./events";
import message from "./message";

function registerListeners(app: App) {
  events.register(app);
  message.register(app);
}

export default registerListeners;
