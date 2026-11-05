import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { serverEnv } from "@/data/serverEnv";
import { authRelations } from "./auth-relations";

const globalForPg = globalThis as unknown as {
  pgClient?: ReturnType<typeof postgres>;
};

const client =
  globalForPg.pgClient ??
  postgres(serverEnv.DATABASE_URL ?? "", {
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgClient = client;
}

const db = drizzle({
  client,
  relations: {
    ...authRelations,
  },
});

export default db;
