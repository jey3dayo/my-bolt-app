import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";
import { createErrorMessage, getReplies } from "../../lib/slack";
import { generateChatStream, getResponse } from "../../llms/openai";

export interface AppMentionEventWithFiles extends SlackEventMiddlewareArgs<"app_mention"> {
  event: SlackEventMiddlewareArgs<"app_mention">["payload"] & {
    files?: unknown[];
  };
}

const appMentionCallback = async ({
  client,
  event,
  say,
  context,
  logger,
}: AllMiddlewareArgs & AppMentionEventWithFiles) => {
  logger.info("[app_mention]");

  try {
    const messages = await getReplies({ client, event, context });
    if (!messages) return;

    const stream = await generateChatStream(messages, logger);
    const responseText = await getResponse(stream);
    if (!responseText) return;

    const { channel, ts } = event;
    await say({
      channel,
      thread_ts: ts,
      text: responseText,
    });
  } catch (error) {
    logger.error(error);
    await say(createErrorMessage(error.message));
  }
};

export default appMentionCallback;
