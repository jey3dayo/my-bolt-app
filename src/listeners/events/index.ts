import { App } from "@slack/bolt";
import appMentionCallback from "./app-mention";

function register(app: App) {
  app.event("app_mention", appMentionCallback);
}

export default { register };
