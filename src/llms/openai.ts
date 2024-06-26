import { OpenAI } from "openai";
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { IterableReadableStream } from "@langchain/core/utils/stream";
import type { Message } from "../lib/slack";
import { defaultModel, defaultImageModel, BOT_USER, IMAGE_SIZE } from "../constants";
import { systemPrompt } from "../constants/prompt";
import { BaseLanguageModelInput } from "@langchain/core/language_models/base";

const chatModel = new ChatOpenAI({
  modelName: defaultModel,
});

const llmClient = new OpenAI();

const parser = new StringOutputParser();

export function createChatStream(messages: BaseLanguageModelInput) {
  return chatModel.pipe(parser).stream(messages);
}

export async function generateChatStream(threadMessages: Message[], logger: any) {
  try {
    const messages = [new SystemMessage(systemPrompt.chat)];

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

export async function summaryChatStream(message: string, prompt: string, logger: any) {
  try {
    const messages = [new SystemMessage(systemPrompt.chat)];
    messages.push(new AIMessage(prompt));
    messages.push(new HumanMessage(message));

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
    const messages = [new SystemMessage(systemPrompt.emotion)];

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

export async function generateImages(prompt: string, n: number, logger: any): Promise<string[]> {
  const options: OpenAI.Images.ImageGenerateParams = {
    model: defaultImageModel,
    prompt,
    size: IMAGE_SIZE,
    n: n,
  };

  try {
    const { data } = await llmClient.images.generate(options);
    if (!data) throw new Error("Failed images generate");
    logger.info("Generated image URL:", data[0].url);
    return data.map((v) => v.url!);
  } catch (error) {
    logger.error("Error generating image:", error);
    throw error;
  }
}
