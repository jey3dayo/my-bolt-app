import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";
import { createErrorMessage } from "../../lib/slack";

const sampleMessageCallback = async ({
  context,
  say,
  logger,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<"message">) => {
  logger.info("[sample-message]");

  try {
    const greeting = context.matches?.[0] ?? "Hello";
    await say(`${greeting}, how are you?`);
  } catch (error) {
    logger.error(error);
    await say(createErrorMessage(error));
  }
};

export default sampleMessageCallback;
