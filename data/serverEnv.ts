import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

export const serverEnv = createEnv({
  server: {
    DATABASE_URL: z.url(),
    BETTER_AUTH_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),
    LOCAL_EMBEDDING_BASE_URL: z.url().optional(),
    EMBEDDING_PROVIDER: z.enum(["openai"]).optional(),
    OPENAI_API_KEY: z.string().min(1).optional(),
    CRON_SECRET: z.string().min(1).optional(),
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
    GOOGLE_REFRESH_TOKEN: z.string().min(1).optional(),
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().optional(),
    RATE_LIMIT_WINDOW_HOURS: z.coerce.number().optional(),
  },
  experimental__runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    LOCAL_EMBEDDING_BASE_URL: process.env.LOCAL_EMBEDDING_BASE_URL,
    EMBEDDING_PROVIDER: process.env.EMBEDDING_PROVIDER,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
    RATE_LIMIT_WINDOW_HOURS: process.env.RATE_LIMIT_WINDOW_HOURS,
  },
  emptyStringAsUndefined: true,
});
