import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { authRelations } from "./auth-relations";

const client = postgres(process.env.DATABASE_URL as string);
const db = drizzle({
  client,
  relations: {
    ...authRelations,
  },
});

export default db;
