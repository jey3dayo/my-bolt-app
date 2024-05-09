import { AllMiddlewareArgs, GenericMessageEvent, SlackEventMiddlewareArgs } from "@slack/bolt";
import { createErrorMessage, getReplies } from "../../lib/slack";
import { generateChatStream, getResponse } from "../../llms/openai";

const IM_CHANNEL_TYPE = "im";

async function imCallback({
  client,
  event,
  say,
  context,
  logger,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<"message">) {
  if (event.channel_type !== IM_CHANNEL_TYPE) return;
  logger.info("[IM]");

  try {
    const messages = await getReplies({ client, event, context });
    if (!messages) return;

    const stream = await generateChatStream(messages, logger);
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
    await say(createErrorMessage(error.message));
  }
}

export default imCallback;
