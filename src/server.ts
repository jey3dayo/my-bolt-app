import type { Context, GenericMessageEvent } from "@slack/bolt";
import slackBolt from "@slack/bolt";
import { env } from "./env";
import { getReplies, getUsers, replaceIds } from "./lib/slack";
import { getLlmResponse } from "./lib/openai";

const { App } = slackBolt;

const app = new App({
  token: env.SLACK_BOT_TOKEN,
  signingSecret: env.SLACK_SIGNING_SECRET,
  appToken: env.SLACK_APP_TOKEN,
  port: Number(env.PORT || 3000),
  socketMode: true,
});

// // channelに返信
// app.message("hi", async ({ message, say }: any) => {
//   // say() sends a message to the channel where the event was triggered
//   await say(`Hey there <@${message.user}>!`);
// });

// IM
app.message(async ({ client, message, say, context, logger }) => {
  if (message.channel_type !== "im") return;
  console.log("[IM]");

  try {
    const users = getUsers(context as Context);
    const replies = await getReplies({ client, message, users });
    console.log({ replies });

    // TODO: 後で作る
    const llm: any = null;
    const text = getLlmResponse(replies, llm);
    await say({
      text,
      channel: message.channel,
      thread_ts: message.ts,
    });
  } catch (error) {
    logger.error(error);
  }
});

// mention
app.event("app_mention", async ({ event, client, logger }) => {
  console.log("[app_mention]");

  try {
  } catch (error) {
    logger.error(error);
  }
});

// app.message(/懇親会|飲み会|女子会|パーティ/, async ({ message, say, client }) => {
//   console.info("懇親会|飲み会|女子会|パーティが送られました");
//   const responseMessage = await getPartyCallResponse(client, message);
//   if (responseMessage.trim()) {
//     await say({
//       text: responseMessage,
//       channel: message.channel,
//       thread_ts: message.ts,
//     });
//   }
// });

(async () => {
  // Start your app
  await app.start();
  console.log("⚡️ Bolt app is running!");
})();
