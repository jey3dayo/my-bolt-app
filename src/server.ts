import slackBolt from "@slack/bolt";
import { env } from "./env";

const { App } = slackBolt;

// ボットトークンと Signing Secret を使ってアプリを初期化します
const app = new App({
  token: env.SLACK_BOT_TOKEN,
  signingSecret: env.SLACK_SIGNING_SECRET,
  appToken: env.SLACK_APP_TOKEN,
  port: Number(env.PORT || 3000),
  socketMode: true,
});

// Listens to incoming messages that contain "hello"
app.message("hello", async ({ message, say }: any) => {
  // say() sends a message to the channel where the event was triggered
  await say(`Hey there <@${message.user}>!`);
});

// app.message("", async ({ message, say }) => {
//   if (!message.subtype) {
//     await say(`Hello, <@${message.user}>. You said: ${message.text}`);
//   }
// });

(async () => {
  // Start your app
  await app.start();
  console.log("⚡️ Bolt app is running!");
})();
