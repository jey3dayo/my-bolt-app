import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";
import type { Logger } from "@slack/logger";
import { getReplies } from "./slack.js";
import { generateChatStream, getResponse } from "../llms/openai.js";
import { withErrorHandling } from "../middleware/error-handler.js";

// Common chat handler parameters
export interface ChatHandlerParams<T extends string = string> {
  client: AllMiddlewareArgs["client"];
  event: SlackEventMiddlewareArgs<T>["event"];
  context: AllMiddlewareArgs["context"];
  say: AllMiddlewareArgs["say"];
  logger: Logger;
  logPrefix: string;
  // eslint-disable-next-line no-unused-vars
  preProcessor?: (_event: SlackEventMiddlewareArgs<T>["event"]) => boolean;
}

// Core chat processing logic
async function processChatRequest<T extends string>({
  client,
  event,
  context,
  say,
  logger,
  logPrefix,
  preProcessor,
}: ChatHandlerParams<T>): Promise<void> {
  logger.info(`${logPrefix} Processing chat request`);

  // Apply pre-processing filter if provided
  if (preProcessor && !preProcessor(event)) {
    logger.debug(`${logPrefix} Pre-processor rejected event`);
    return;
  }

  // Get conversation history
  const messages = await getReplies({ client, event, context });
  if (!messages) {
    logger.debug(`${logPrefix} No messages retrieved`);
    return;
  }

  // Generate AI response
  const stream = await generateChatStream(messages, logger);
  const responseText = await getResponse(stream);
  if (!responseText) {
    logger.debug(`${logPrefix} No response text generated`);
    return;
  }

  // Send response to Slack
  const { channel, ts } = event;
  await say({
    channel,
    thread_ts: ts,
    text: responseText,
  });

  logger.info(`${logPrefix} Chat request processed successfully`);
}

// Exported chat handler with error handling
export function createChatHandler<T extends string>(
  logPrefix: string,
  // eslint-disable-next-line no-unused-vars
  preProcessor?: (_event: SlackEventMiddlewareArgs<T>["event"]) => boolean,
) {
  return withErrorHandling(
    async (args: AllMiddlewareArgs & SlackEventMiddlewareArgs<T>) => {
      await processChatRequest({
        client: args.client,
        event: args.event,
        context: args.context,
        say: args.say,
        logger: args.logger,
        logPrefix,
        preProcessor,
      });
    },
    { handlerType: "chat", logPrefix },
  );
}

// Specific pre-processors for different event types
export const imPreProcessor = (event: SlackEventMiddlewareArgs<"message">["event"]) => {
  // Only process IM messages without subtypes
  return event.channel_type === "im" && !event.subtype;
};

// eslint-disable-next-line no-unused-vars
export const appMentionPreProcessor = (_event: SlackEventMiddlewareArgs<"app_mention">["event"]) => {
  // App mentions are always processed (no additional filtering needed)
  return true;
};
