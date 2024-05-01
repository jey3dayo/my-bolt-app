import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";

const sampleMessageCallback = async ({
  context,
  say,
  logger,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<"message">) => {
  logger.info("[sample-message]");

  try {
    const greeting = context.matches[0];
    await say(`${greeting}, how are you?`);
  } catch (error) {
    console.error(error);
  }
};

export default sampleMessageCallback;
