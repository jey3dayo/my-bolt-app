import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";
import { createErrorMessage, getHistory } from "../../lib/slack";
import { getResponse, summaryChatStream } from "../../llms/openai";

const targetReactions = ["kirbyrun"];
const matchRegex = /kirby|youyaku|summary/;

const appMentionCallback = async ({
  client,
  event,
  say,
  logger,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<"reaction_added">) => {
  logger.info("[reaction_added]");

  if (!(targetReactions.includes(event.reaction) || event.reaction.match(matchRegex))) {
    return;
  }

  try {
    // TODO: スレッドの中のテキストを読み取りたいがスレッドの親になってる
    const history = await getHistory({ client, event });
    if (!history) throw new Error("history is empty");
    const text = history.shift();
    logger.info(`history: ${text}`);

    const stream = await summaryChatStream(text!, logger);
    const responseText = await getResponse(stream);
    if (!responseText) return;

    await client.chat.postMessage({
      channel: event.item.channel,
      thread_ts: event.item.ts,
      text: responseText,
    });
  } catch (error) {
    logger.error(error);
    await say(createErrorMessage(error));
  }
};

export default appMentionCallback;
