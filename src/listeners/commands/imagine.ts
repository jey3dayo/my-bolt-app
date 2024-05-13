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
  const { text: prompt, channel_id: channel } = command;
  logger.info(`[${command.command}]`);

  try {
    if (!prompt) {
      await say("プロンプトが空です。入力してください。");
      return;
    }

    const event = await say(templateMessage.generating);
    const ts = event.ts!;

    const n = 1; // n = 1のみ対応
    const imageUrls = await generateImages(prompt, n, logger);
    if (!imageUrls) throw new Error("Image URL is not found");

    await postImageToSlack({ client, prompt, imageUrls, channel, ts });

    // 投稿を削除
    await client.chat.delete({ channel, ts });
  } catch (error) {
    logger.error(error);
    await say(createErrorMessage(error));
  }
}

export default imagineCallback;
