import { AllMiddlewareArgs, GenericMessageEvent, SlackEventMiddlewareArgs } from "@slack/bolt";
import { getReplies } from "../../lib/slack";
import { chatStream, getResponse } from "../../llms/openai";

async function keywordCallback({
  client,
  event,
  say,
  context,
  logger,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<"message">) {
  logger.info("[Keyword]");

  try {
    const messages = await getReplies({ client, event, context });
    if (!messages) return;

    const stream = await chatStream(messages);
    const responseText = await getResponse(stream);
    if (!responseText) return;

    // const { channel, ts } = event as GenericMessageEvent;
    // await say({
    //   channel,
    //   thread_ts: ts,
    //   text: responseText,
    // });
  } catch (error) {
    logger.error(error);
  }
}

export default keywordCallback;
