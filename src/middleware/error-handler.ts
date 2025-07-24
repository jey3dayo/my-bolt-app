import type { AllMiddlewareArgs } from "@slack/bolt";
import type { Logger } from "@slack/logger";
import { ErrorType, type AppError } from "../types/slack.js";

// Error classification
export function classifyError(error: unknown): AppError {
  if (error instanceof Error) {
    // Slack API errors
    if (error.message.includes("slack") || error.message.includes("channel") || error.message.includes("token")) {
      return {
        type: ErrorType.SLACK_API,
        message: "Slack APIでエラーが発生しました",
        originalError: error,
      };
    }

    // OpenAI API errors
    if (error.message.includes("openai") || error.message.includes("ai") || error.message.includes("model")) {
      return {
        type: ErrorType.OPENAI_API,
        message: "AI処理でエラーが発生しました",
        originalError: error,
      };
    }

    // File operation errors
    if (error.message.includes("file") || error.message.includes("download") || error.message.includes("upload")) {
      return {
        type: ErrorType.FILE_OPERATION,
        message: "ファイル操作でエラーが発生しました",
        originalError: error,
      };
    }

    // Validation errors
    if (error.message.includes("validation") || error.message.includes("invalid")) {
      return {
        type: ErrorType.VALIDATION,
        message: "入力データに問題があります",
        originalError: error,
      };
    }
  }

  // Unknown errors
  return {
    type: ErrorType.UNKNOWN,
    message: "予期しないエラーが発生しました",
    originalError: error,
  };
}

// Create user-friendly error message
export function createUserErrorMessage(appError: AppError): string {
  const baseMessages = {
    [ErrorType.SLACK_API]: "Slackとの通信でエラーが発生しました。しばらく待ってから再度お試しください。",
    [ErrorType.OPENAI_API]: "AI処理でエラーが発生しました。しばらく待ってから再度お試しください。",
    [ErrorType.FILE_OPERATION]: "ファイルの処理でエラーが発生しました。ファイル形式や サイズを確認してください。",
    [ErrorType.VALIDATION]: "入力内容に問題があります。コマンドや添付ファイルを確認してください。",
    [ErrorType.UNKNOWN]: "予期しないエラーが発生しました。管理者にお問い合わせください。",
  };

  return baseMessages[appError.type];
}

// Log error with structured logging
export function logError(logger: Logger, appError: AppError, context?: Record<string, unknown>): void {
  const logData = {
    errorType: appError.type,
    message: appError.message,
    context: { ...appError.context, ...context },
    ...(appError.originalError instanceof Error && {
      originalMessage: appError.originalError.message,
      stack: appError.originalError.stack,
    }),
  };

  logger.error("Application error occurred", logData);
}

// Main error handler middleware
export async function handleError(
  error: unknown,
  args: AllMiddlewareArgs,
  context?: Record<string, unknown>,
): Promise<void> {
  const appError = classifyError(error);

  // Log the error
  logError(args.logger, appError, context);

  // Send user-friendly message
  const userMessage = createUserErrorMessage(appError);

  try {
    if ("say" in args && typeof args.say === "function") {
      await args.say(userMessage);
    } else if ("respond" in args && typeof args.respond === "function") {
      await args.respond(userMessage);
    }
  } catch (responseError) {
    // If we can't respond to the user, just log it
    args.logger.error("Failed to send error message to user", {
      originalError: appError,
      responseError: responseError instanceof Error ? responseError.message : String(responseError),
    });
  }
}

// Higher-order function to wrap handlers with error handling
export function withErrorHandling<T extends AllMiddlewareArgs>(
  // eslint-disable-next-line no-unused-vars
  handler: (_args: T) => Promise<void>,
  context?: Record<string, unknown>,
) {
  return async (args: T): Promise<void> => {
    try {
      await handler(args);
    } catch (error) {
      await handleError(error, args, context);
    }
  };
}
