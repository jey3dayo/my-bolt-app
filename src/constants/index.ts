import { env } from "../env";

export const debug = env.DEBUG_MODE === "true";

export const BOT_USER = "system";
export const USER = "user";

export const defaultModel = env.DEFAULT_MODEL;
export const extraModel = env.EXTRA_MODEL;
export const defaultImageModel = env.IMAGE_MODEL;

export const IMAGE_SIZE = "1024x1024";

export const templateMessage = {
  emptyPrompt: "プロンプトが空です。入力してください。",
  generating: "生成中・・・",
};
