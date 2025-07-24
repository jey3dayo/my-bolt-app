import fs from "node:fs";
import util from "node:util";
import os from "node:os";
import path from "node:path";
import slackBolt, { LogLevel } from "@slack/bolt";
import type { App, Context, GenericMessageEvent, AppMentionEvent, KnownEventFromType } from "@slack/bolt";
import { env } from "../env";
import { BOT_USER, USER } from "../constants";

export type ChannelType = "dm" | "public_channel" | "private_channel";
export type UserType = typeof BOT_USER | typeof USER;

export type Users = {
  [key: string]: UserType;
};

export type Message = {
  user: UserType | string;
  text: string | undefined;
};

export function getSlackApp() {
  const { App } = slackBolt;

  return new App({
    token: env.SLACK_BOT_TOKEN,
    signingSecret: env.SLACK_SIGNING_SECRET,
    appToken: env.SLACK_APP_TOKEN,
    port: Number.parseInt(env?.PORT ?? "3000", 10),
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

type getHistoryArgs = {
  client: App["client"];
  event: KnownEventFromType<"reaction_added">;
};

export async function getHistory({ client, event }: getHistoryArgs): Promise<string[]> {
  try {
    const response = await client.conversations.history({
      channel: event.item.channel,
      latest: event.item.ts,
      inclusive: true,
      limit: 1,
    });

    if (!response?.messages?.length) {
      throw new Error(`No messages found for channel: ${event.item.channel}, ts: ${event.item.ts}`);
    }

    return response.messages.map((v) => v.text ?? "");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`Failed to fetch message history: ${errorMessage}`);
  }
}

type PostImageToSlackArgs = {
  client: App["client"];
  prompt: string;
  imageUrls: string[];
  channel: string;
};

type UploadFiles = {
  files: {
    id: string;
    permalink: string;
    url_private: string;
  }[];
};

export async function postImageToSlack({ client, prompt, imageUrls, channel }: PostImageToSlackArgs): Promise<unknown> {
  return Promise.all(
    imageUrls.map(async (imageUrl) => {
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, `${prompt}.png`);
      fs.writeFileSync(tempFilePath, buffer);

      const result = await client.files.uploadV2({
        channel_id: channel,
        title: prompt,
        alt_text: prompt,
        initial_comment: prompt,
        file: fs.createReadStream(tempFilePath),
        filename: `${prompt}.png`,
      });

      // 一時ファイルを削除
      fs.unlinkSync(tempFilePath);

      const resultFiles = result.files as UploadFiles;
      return resultFiles[0].files[0];
    }),
  );
}

export function getChannelType(channelId: string): "dm" | "public_channel" | "private_channel" | "unknown" {
  if (channelId.startsWith("D")) {
    return "dm";
  }

  if (channelId.startsWith("C")) {
    return "public_channel";
  }

  if (channelId.startsWith("G")) {
    return "private_channel";
  }

  return "unknown";
}

export function isGenericMessageEvent(event: KnownEventFromType<"message">): event is GenericMessageEvent {
  return event.channel_type === "im";
}

export function createErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return ["エラーが発生しました", `message: ${error.message}`, `stack: ${error.stack}`].join("\n");
  }
  return ["エラーが発生しました", `message: ${String(error)}`].join("\n");
}

export function beautifyJSON(json: unknown) {
  return util.inspect(json, { depth: null });
}
