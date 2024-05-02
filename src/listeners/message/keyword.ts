import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";
import { getReplies } from "../../lib/slack";
import { getEmotion, getResponse } from "../../llms/openai";

async function keywordCallback({
  client,
  event,
  context,
  logger,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<"message">) {
  logger.info("[Detect Keyword]");

  try {
    const messages = await getReplies({ client, event, context });
    if (!messages) return;

    try {
      // LLM で絵文字リストを取得する
      const stream = await getEmotion(messages, logger);
      const response = await getResponse(stream);
      const emotions = response?.split(",") ?? [];

      for (const emotion of emotions) {
        // 失敗するの前提でtry-catchする
        // 返信メッセージにリアクションを付ける
        await client.reactions
          .add({
            channel: event.channel,
            timestamp: event.ts,
            name: emotion,
          })
          .catch(() => {
            logger.info("Failed to add reaction:", emotion);
          });
      }
    } catch (e) {
      logger.error(`Failed to get emotions: ${e.message}`, { error: e });
    }
  } catch (error) {
    logger.error(error);
  }
}

export default keywordCallback;
