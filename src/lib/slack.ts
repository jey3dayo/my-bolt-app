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
    port: Number(env.PORT || 3000),
    socketMode: true,
    logLevel: LogLevel.INFO,
  });
}

function getUsers(context: Context): Users {
  const { botId, botUserId, userId } = context;
  const users: Users = {};

  if (botId) users[botId] = "system";
  if (botUserId) users[botUserId] = "system";
  if (userId) users[userId] = "user";

  return users;
}

export async function getReplies({
  client,
  event,
  context,
}: {
  client: App["client"];
  event: GenericMessageEvent | AppMentionEvent | KnownEventFromType<"message">;
  context: Context;
}): Promise<Message[] | null> {
  const { channel, thread_ts, ts } = event as GenericMessageEvent;
  const threadTimestamp = thread_ts ?? ts;

  const users = getUsers(context);

  const replies = await client.conversations.replies({
    channel,
    ts: threadTimestamp,
    inclusive: true,
  });

  if (replies?.messages) {
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

export function isGenericMessageEvent(event: KnownEventFromType<"message">): event is GenericMessageEvent {
  return event.channel_type === "im";
}
