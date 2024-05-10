import { App } from "@slack/bolt";
import appMentionCallback from "./app-mention";
import reactionAddedCallback from "./reaction-added";

function register(app: App) {
  app.event("app_mention", appMentionCallback);
  app.event("reaction_added", reactionAddedCallback);
}

export default { register };
