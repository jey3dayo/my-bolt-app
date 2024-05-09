import { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from "@slack/bolt";
import { generateImages } from "../../llms/openai";
import { createErrorMessage, postImageToSlack } from "../../lib/slack";
import { templateMessage } from "../../constants";

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
      await say("プロンプトが空です。入力してください。");
      return;
    }

    const event = await say(templateMessage.generating);
    const ts = event.ts!;

    const n = 1;
    const imageUrls = await generateImages(prompt, n, logger);
    if (!imageUrls) throw new Error("Image URL is not found");

    await postImageToSlack({ client, prompt, imageUrls, channel, ts });
  } catch (error) {
    logger.error(error);
    await say(createErrorMessage(error));
  }
}

export default imagineCallback;
