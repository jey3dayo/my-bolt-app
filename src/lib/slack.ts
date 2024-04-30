import type { App, Context, GenericMessageEvent, AppMentionEvent, KnownEventFromType } from "@slack/bolt";
import { BOT_USER, USER } from "./constants";

type Users = {
  [key: string]: BOT_USER | USER;
};

export async function getReplies({
  client,
  message,
  users = {},
}: {
  client: App["client"];
  message: GenericMessageEvent | AppMentionEvent | KnownEventFromType<"message">;
  users: Users;
}): Promise<string> {
  const { channel, thread_ts, ts } = message as GenericMessageEvent;
  const threadTimestamp = thread_ts ?? ts;

  const replies = await client.conversations.replies({
    channel,
    ts: threadTimestamp,
    inclusive: true,
  });

  if (replies?.messages) {
    const summary = replies.messages.map((v) => ({
      user: users?.[v.user] ?? v.user,
      text: v.text,
    }));
    return JSON.stringify(summary);
  }

  return "";
}

export function getUsers(context: Context): Users {
  const { botId, botUserId, userId } = context;
  const users = {};

  if (botId) users[botId] = "system";
  if (botUserId) users[botUserId] = "system";
  if (userId) users[userId] = "user";

  return users;
}

export const isGenericMessageEvent = (event: KnownEventFromType<"message">): event is GenericMessageEvent => {
  return event.channel_type === "im";
};
