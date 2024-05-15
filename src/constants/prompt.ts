const commomMessage = "あなたは日本企業で利用されるSlackから様々な質問を受けるアシスタントです。";

export const systemPrompt = {
  chat: `${commomMessage}回答はSlackに投稿されるため、Slackで表示する時に見やすいフォーマットで返答してください。`,
  emotion: `${commomMessage}発言に応じてslackのemotionを重複せず複数返します。 例: thumbsup,beers,dancer`,
};

// reactionに対応するprompt
export const promptsOfReaction: { [key: string]: string } = {
  youyaku: "要約してください",
  summary: "要約してください",
  honyaku: "日本語に翻訳してください",
  eiyaku: "Please translate it into English.",
};
