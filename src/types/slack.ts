/* eslint-disable no-unused-vars */
import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";

// Basic Slack types
export type ChannelType = "dm" | "public_channel" | "private_channel";

export type UserType = typeof BOT_USER | typeof USER;

export type Users = { [key: string]: UserType };

export type Message = {
  user: UserType | string;
  text: string | undefined;
};

// Constants
export const BOT_USER = "bot_user" as const;
export const USER = "user" as const;
export const IM_CHANNEL_TYPE = "im" as const;

// Function parameter types
export interface GetRepliesArgs {
  channel: string;
  ts: string;
}

export interface GetHistoryArgs {
  channel: string;
  limit?: number;
}

export interface PostImageToSlackArgs {
  channel: string;
  imageBuffer: Buffer;
  filename: string;
  title?: string;
  initial_comment?: string;
}

export interface UploadFiles {
  channels: string[];
  file: Buffer;
  filename: string;
  title?: string;
  initial_comment?: string;
}

// Extended event types
export interface AppMentionEventWithFiles {
  event: SlackEventMiddlewareArgs<"app_mention">["event"] & {
    files?: Array<{
      id: string;
      name: string;
      mimetype: string;
      url_private: string;
    }>;
  };
}

// Error handling types
export enum ErrorType {
  SLACK_API = "SLACK_API",
  OPENAI_API = "OPENAI_API",
  FILE_OPERATION = "FILE_OPERATION",
  VALIDATION = "VALIDATION",
  UNKNOWN = "UNKNOWN",
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: unknown;
  context?: Record<string, unknown>;
}

// Common response types
export interface SlackResponse {
  success: boolean;
  message?: string;
  error?: AppError;
}

// Handler types
export type SlackEventHandler<T extends string = string> = (
  _args: AllMiddlewareArgs & SlackEventMiddlewareArgs<T>,
) => Promise<void>;

export type SlackAppMentionHandler = SlackEventHandler<"app_mention">;
export type SlackMessageHandler = SlackEventHandler<"message">;
