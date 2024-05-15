import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";
import { createErrorMessage, getHistory } from "../../lib/slack";
import { getResponse, summaryChatStream } from "../../llms/openai";
import { promptsOfReaction } from "../../constants/prompt";

function getPrompt(reaction: string): string | null {
  return promptsOfReaction[reaction] || null;
}

type FetchHistoryTextProps = {
  client: AllMiddlewareArgs["client"];
  event: SlackEventMiddlewareArgs<"reaction_added">["event"];
  logger: AllMiddlewareArgs["logger"];
};

const fetchHistoryText = async ({ client, event, logger }: FetchHistoryTextProps): Promise<string | null> => {
  const history = await getHistory({ client, event });
  if (!history || history.length === 0) {
    const msg = "Error: history is empty";
    logger.error(msg);
    throw new Error(msg);
  }
  const text = history.shift() ?? null;
  logger.info(`history: ${text}`);
  return text;
};

const appMentionCallback = async ({
  client,
  event,
  say,
  logger,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<"reaction_added">) => {
  logger.info("[reaction_added]");

  if (!event.reaction) return;

  try {
    // TODO: スレッドの中のテキストを読み取りたいがスレッドの親になってる
    const text = await fetchHistoryText({ client, event, logger });
    if (!text) return;

    const prompt = getPrompt(event.reaction);
    if (!prompt) return;

    const stream = await summaryChatStream(text, prompt, logger);
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
