import { App } from "@slack/bolt";
import imCallback from "./im";
import sampleMessageCallback from "./sample-message";
import keywordCallback from "./keyword";

function register(app: App) {
  app.message(imCallback);
  app.message(/^(hi|hello|hey).*/, sampleMessageCallback);
  app.message(/(懇親会|飲み会|女子会|パーティ).*/, keywordCallback);
}

export default { register };
