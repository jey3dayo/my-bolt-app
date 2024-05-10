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
    // const imageUrls = await generateImages(prompt, n, logger);
    const imageUrls = [
      "https://oaidalleapiprodscus.blob.core.windows.net/private/org-Y4IB7d18XRTVXnmt5ljOx1cR/user-aQTe3OWAxMmNVFMBn5kGIZHX/img-CmIg4eHd7CeYwYzhL3Qu4K6Z.png?st=2024-05-10T09%3A01%3A53Z&se=2024-05-10T11%3A01%3A53Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-05-09T22%3A45%3A57Z&ske=2024-05-10T22%3A45%3A57Z&sks=b&skv=2021-08-06&sig=SEfZiVnhzz3TWSFfc7zP4wzm%2BgqldQqGpqmCDOOgkvY%3D",
    ];
    if (!imageUrls) throw new Error("Image URL is not found");

    await postImageToSlack({ client, prompt, imageUrls, channel, ts });
  } catch (error) {
    logger.error(error);
    await say(createErrorMessage(error));
  }
}

export default imagineCallback;
