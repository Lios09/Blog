import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { serverEnv } from "./data/serverEnv";

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: serverEnv.DATABASE_URL,
  },
});
