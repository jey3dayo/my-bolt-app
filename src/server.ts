import { getSlackApp } from "./lib/slack";
import registerListeners from "./listeners";

const app = getSlackApp();

registerListeners(app);

(async () => {
  await app.start();
  console.log("⚡️ Bolt app is running!");
})();
