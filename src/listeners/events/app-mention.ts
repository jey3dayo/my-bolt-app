import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";
import { getReplies } from "../../lib/slack";
import { chatStream, getResponse } from "../../llms/openai";

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

    const stream = await chatStream(messages);
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
  }
};

export default appMentionCallback;
