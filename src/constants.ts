import { SystemMessage } from "@langchain/core/messages";
import { env } from "./env";

export const BOT_USER = "system";
export const USER = "user";

export const defaultModel = env.DEFAULT_MODEL;
export const extraModel = env.EXTRA_MODEL;

export const templateMessage = new SystemMessage(
  `あなたは日本企業で利用されるSlackから様々な質問を受けるアシスタントです。
回答はSlackに投稿されるため、Slackで表示する時に見やすいフォーマットで返答してください。
`,
);
