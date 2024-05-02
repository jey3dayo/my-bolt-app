import { SystemMessage } from "@langchain/core/messages";
import { env } from "./env";

export const BOT_USER = "system";
export const USER = "user";

export const defaultModel = env.DEFAULT_MODEL;
export const extraModel = env.EXTRA_MODEL;

const initializeMessage = "あなたは日本企業で利用されるSlackから様々な質問を受けるアシスタントです。";

export const templateMessage = new SystemMessage(
  `${initializeMessage}回答はSlackに投稿されるため、Slackで表示する時に見やすいフォーマットで返答してください。`,
);

export const templateEmotionMessage = new SystemMessage(
  `${initializeMessage}発言に応じてslackのemotionを重複せず複数返します。 例: thumbsup,beers,dancer`,
);
