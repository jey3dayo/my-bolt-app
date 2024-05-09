import slackBolt, { LogLevel } from "@slack/bolt";
import type { App, Context, GenericMessageEvent, AppMentionEvent, KnownEventFromType } from "@slack/bolt";
import { env } from "../env";
import { BOT_USER, USER } from "../constants";

export type USER_TYPE = typeof BOT_USER | typeof USER;

export type Users = {
  [key: string]: USER_TYPE;
};

export type Message = {
  user: USER_TYPE | string;
  text: string | undefined;
};

export function getSlackApp() {
  const { App } = slackBolt;

  return new App({
    token: env.SLACK_BOT_TOKEN,
    signingSecret: env.SLACK_SIGNING_SECRET,
    appToken: env.SLACK_APP_TOKEN,
    port: parseInt(env.PORT, 10) || 3000,
    socketMode: true,
    logLevel: LogLevel.INFO,
  });
}

function getUsers(context: Context): Users {
  const { botId, botUserId, userId } = context;
  const users: Users = {};

  if (botId) users[botId] = BOT_USER;
  if (botUserId) users[botUserId] = BOT_USER;
  if (userId) users[userId] = USER;

  return users;
}

type getRepliesArgs = {
  client: App["client"];
  event: GenericMessageEvent | AppMentionEvent | KnownEventFromType<"message">;
  context: Context;
};

export async function getReplies({ client, event, context }: getRepliesArgs): Promise<Message[] | null> {
  const { channel, thread_ts, ts } = event as GenericMessageEvent;
  const threadTimestamp = thread_ts ?? ts;

  const users = getUsers(context);

  const replies = await client.conversations.replies({
    channel,
    ts: threadTimestamp,
    inclusive: true,
  });

  if (replies && replies?.messages) {
    const summary = replies.messages.map((v) => {
      const userId = v?.user ?? "";
      return {
        user: users?.[userId] ?? userId,
        text: v.text,
        ts: v.ts,
      };
    });
    return summary;
  }

  return null;
}

type PostImageToSlackArgs = {
  client: App["client"];
  prompt: string;
  imageUrl: string;
  channel: string;
  ts: string;
};

export async function postImageToSlack({ client, ts, prompt, imageUrl, channel }: PostImageToSlackArgs): Promise<void> {
  // await client.chat.postMessage({
  await client.chat.update({
    channel: channel,
    ts,
    text: prompt,
    blocks: [
      {
        type: "image",
        title: {
          type: "plain_text",
          text: prompt,
        },
        image_url: new URL(imageUrl).toString(),
        alt_text: prompt,
      },
    ],
  });
}

export function isGenericMessageEvent(event: KnownEventFromType<"message">): event is GenericMessageEvent {
  return event.channel_type === "im";
}

export function createErrorMessage(error: Error) {
  return `エラーが発生しました\n message: ${error.message}\n stack: ${error.stack}`;
}
