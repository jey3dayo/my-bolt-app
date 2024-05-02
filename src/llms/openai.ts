import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { IterableReadableStream } from "@langchain/core/utils/stream";
import type { Message } from "../lib/slack";
import { templateMessage, defaultModel, BOT_USER, templateEmotionMessage } from "../constants";

const chatModel = new ChatOpenAI({
  modelName: defaultModel,
});

const parser = new StringOutputParser();

export async function chatStream(threadMessages: Message[], logger: any) {
  try {
    const messages = [templateMessage];

    threadMessages?.forEach((message) => {
      if (!message.text) return;
      messages.push(message.user === BOT_USER ? new AIMessage(message.text) : new HumanMessage(message.text));
    });

    return chatModel.pipe(parser).stream(messages);
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
    throw new Error("Error generating content stream");
  }
}
