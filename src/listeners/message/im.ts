import { AllMiddlewareArgs, GenericMessageEvent, SlackEventMiddlewareArgs } from "@slack/bolt";
import { getReplies } from "../../lib/slack";
import { chatStream, getResponse } from "../../llms/openai";

async function imCallback({
  client,
  event,
  say,
  context,
  logger,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<"message">) {
  if (event.channel_type !== "im") return;
  logger.info("[IM]");

  try {
    const messages = await getReplies({ client, event, context });
    if (!messages) return;

    const stream = await chatStream(messages);
    const responseText = await getResponse(stream);
    if (!responseText) return;

    const { channel, ts } = event as GenericMessageEvent;
    await say({
      channel,
      thread_ts: ts,
      text: responseText,
    });
  } catch (error) {
    logger.error(error);
  }
}

export default imCallback;
