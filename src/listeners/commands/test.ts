import { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from "@slack/bolt";
import { beautifyJSON, createErrorMessage } from "../../lib/slack";

async function exampleCallback({
  ack,
  command,
  say,
  logger,
}: AllMiddlewareArgs & SlackCommandMiddlewareArgs): Promise<void> {
  await ack();
  logger.info("[Example Command]");

  try {
    const { text: prompt } = command;

    if (prompt === "debug") {
      const target = { ...command, token: "dummy" };
      const json = beautifyJSON(target);
      await say("```\n" + json + "\n```");
      return;
    }

    await say(`call: ${command.command}`);
  } catch (error) {
    logger.error(error);
    await say(createErrorMessage(error));
  }
}

export default exampleCallback;
