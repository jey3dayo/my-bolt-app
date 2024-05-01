import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";
import { getReplies } from "../../lib/slack";
import { getEmotion } from "../../llms/openai";

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

    // TODO: LLM で絵文字リストを取得する
    const emotions = getEmotion("");

    emotions.forEach(async (emotion) => {
      // 返信メッセージにリアクションを付ける
      await client.reactions.add({
        channel: event.channel,
        timestamp: event.ts,
        name: emotion,
      });
    });
  } catch (error) {
    logger.error(error);
  }
}

export default keywordCallback;
