import fs from "fs";
import util from "util";
import os from "os";
import path from "path";
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

type getHistoryArgs = {
  client: App["client"];
  event: KnownEventFromType<"reaction_added">;
};

export async function getHistory({ client, event }: getHistoryArgs): Promise<string[] | undefined | null> {
  const history = await client.conversations.history({
    channel: event.item.channel,
    latest: event.item.ts,
    inclusive: true,
    limit: 1,
  });
  return history ? history?.messages?.map((v) => v.text!).filter((v) => !!v) : null;
}

type PostImageToSlackArgs = {
  client: App["client"];
  prompt: string;
  imageUrls: string[];
  channel: string;
  ts: string | undefined;
};

export async function postImageToSlack({
  client,
  ts,
  prompt,
  imageUrls,
  channel,
}: PostImageToSlackArgs): Promise<void> {
  const uploadedFiles = await Promise.all(
    imageUrls.map(async (imageUrl) => {
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, `${prompt}.png`);
      fs.writeFileSync(tempFilePath, buffer);

      const result = await client.files.uploadV2({
        channel_ids: channel,
        initial_comment: prompt,
        file: fs.createReadStream(tempFilePath),
        // filename: `${prompt}.png`,
        filename: `test.png`,
      });

      // 一時ファイルを削除
      fs.unlinkSync(tempFilePath);

      type ResultFile = { permalink: string };
      type ResultFiles = { files: ResultFile[] };

      const resultFiles = result.files as ResultFiles[];
      return resultFiles[0].files[0].permalink;
    }),
  );

  console.log({ uploadedFiles });

  const args = {
    channel: channel,
    text: prompt,
    blocks: uploadedFiles.map((permalink) => ({
      type: "image",
      title: {
        type: "plain_text",
        text: prompt,
      },
      image_url: permalink,
      alt_text: prompt,
    })),
  };

  if (ts) {
    await client.chat.update({ ts, ...args });
  } else {
    await client.chat.postMessage(args);
  }
}

export function isGenericMessageEvent(event: KnownEventFromType<"message">): event is GenericMessageEvent {
  return event.channel_type === "im";
}

export function createErrorMessage(error: Error) {
  return ["エラーが発生しました", `message: ${error.message}`, `stack: ${error.stack}`].join("\n");
}

export function beautifyJSON(json: unknown) {
  return util.inspect(json, { depth: null });
}
