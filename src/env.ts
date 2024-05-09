import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    OPENAI_API_KEY: z.string().min(1),
    SLACK_BOT_TOKEN: z.string().min(1),
    SLACK_SIGNING_SECRET: z.string().min(1),
    SLACK_APP_TOKEN: z.string().min(1),
    DEFAULT_MODEL: z.string().min(1),
    EXTRA_MODEL: z.string().min(1).optional(),
    IMAGE_MODEL: z.string().min(1).optional(),
    GPT4_ROOM_ID: z.string().min(1).optional(),
    PORT: z.string().optional(),
  },
  runtimeEnv: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
    SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET,
    SLACK_APP_TOKEN: process.env.SLACK_APP_TOKEN,
    DEFAULT_MODEL: process.env.DEFAULT_MODEL,
    EXTRA_MODEL: process.env.EXTRA_MODEL,
    IMAGE_MODEL: process.env.IMAGE_MODEL,
    GPT4_ROOM_ID: process.env.GPT4_ROOM_ID,
    PORT: process.env.PORT,
  },
  skipValidation: !!process.env.CI,
});
