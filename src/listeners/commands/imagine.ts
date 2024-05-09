import { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from "@slack/bolt";
import { generateImage } from "../../llms/openai";
import { createErrorMessage, postImageToSlack } from "../../lib/slack";

async function imagineCallback({
  client,
  ack,
  command,
  say,
  logger,
}: AllMiddlewareArgs & SlackCommandMiddlewareArgs): Promise<void> {
  await ack();
  logger.info("[Imagine Command]");

  try {
    const { text: prompt, channel_id: channel } = command;
    if (!prompt) {
      await ack();
      await say("プロンプトが空です。入力してください。");
      return;
    }

    const imageUrl = await generateImage(prompt, logger);
    if (!imageUrl) {
      throw new Error("Image URL is not found");
    }

    await postImageToSlack({ client, prompt, imageUrl, channel });
  } catch (error) {
    logger.error(error);
    await say(createErrorMessage(error));
  }
}

export default imagineCallback;
