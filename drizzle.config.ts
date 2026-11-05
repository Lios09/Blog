import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { serverEnv } from "./data/serverEnv";

export default defineConfig({
  out: "./db/migrations",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: {
    url: serverEnv.DATABASE_URL,
  },
});
