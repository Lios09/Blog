import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { cache } from "react";
import { serverEnv } from "@/data/serverEnv";
import db from "@/db/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  baseURL: serverEnv.BETTER_AUTH_URL,
  secret: serverEnv.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  plugins: [nextCookies()],
  socialProviders: {
    github: {
      clientId: serverEnv.GH_CLIENT_ID ?? "",
      clientSecret: serverEnv.GH_CLIENT_SECRET ?? "",
    },
  },
});

export const getCurrentUser = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user ?? null;
});
