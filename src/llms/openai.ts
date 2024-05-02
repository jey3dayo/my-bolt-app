import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { IterableReadableStream } from "@langchain/core/utils/stream";
import type { Message } from "../lib/slack";
import { templateMessage, defaultModel, BOT_USER, templateEmotionMessage } from "../constants";
import { BaseLanguageModelInput } from "@langchain/core/language_models/base";

const chatModel = new ChatOpenAI({
  modelName: defaultModel,
});

const parser = new StringOutputParser();

export function createChatStream(messages: BaseLanguageModelInput) {
  return chatModel.pipe(parser).stream(messages);
}

export async function generateChatStream(threadMessages: Message[], logger: any) {
  try {
    const messages = [templateMessage];

    threadMessages?.forEach((message) => {
      if (!message.text) return;
      messages.push(message.user === BOT_USER ? new AIMessage(message.text) : new HumanMessage(message.text));
    });

    return createChatStream(messages);
  } catch (error) {
    logger.error(error);
    throw new Error("Error generating content stream");
  }
}

export async function getResponse(stream: IterableReadableStream<string>) {
  let text = "";
  for await (const chunk of stream) {
    text += chunk;
  }
  if (!text) return;

  return text;
}

export async function getEmotion(threadMessages: Message[], logger: any) {
  try {
    const messages = [templateEmotionMessage];

    threadMessages?.forEach((message) => {
      if (!message.text) return;
      messages.push(message.user === BOT_USER ? new AIMessage(message.text) : new HumanMessage(message.text));
    });

    return chatModel.pipe(parser).stream(messages);
  } catch (error) {
    logger.error(error);
    throw new Error(`Error generating content stream: ${error.message}`);
  }
}
