import { SystemMessage } from "@langchain/core/messages";
import { env } from "./env";

export const debug = env.DEBUG_MODE === "true";

export const BOT_USER = "system";
export const USER = "user";

export const defaultModel = env.DEFAULT_MODEL;
export const extraModel = env.EXTRA_MODEL;
export const defaultImageModel = env.IMAGE_MODEL;

export const IMAGE_SIZE = "1024x1024";

const initializeMessage = "あなたは日本企業で利用されるSlackから様々な質問を受けるアシスタントです。";

export const templateSystemMessage = new SystemMessage(
  `${initializeMessage}回答はSlackに投稿されるため、Slackで表示する時に見やすいフォーマットで返答してください。`,
);

export const templateEmotionMessage = new SystemMessage(
  `${initializeMessage}発言に応じてslackのemotionを重複せず複数返します。 例: thumbsup,beers,dancer`,
);

export const templateMessage = {
  emptyPrompt: "プロンプトが空です。入力してください。",
  generating: "生成中・・・",
};
