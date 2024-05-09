import { App } from "@slack/bolt";
import imagineCallback from "./imagine";

function register(app: App) {
  app.command("/imagine", imagineCallback);
}

export default { register };
