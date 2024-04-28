import { App } from "@slack/bolt";
import { env } from "@/env";

// ボットトークンと Signing Secret を使ってアプリを初期化します
const app = new App({
  token: env.SLACK_BOT_TOKEN,
  signingSecret: env.SLACK_SIGNING_SECRET,
});

(async () => {
  // アプリを起動します
  await app.start(env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
