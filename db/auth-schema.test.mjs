import assert from "node:assert/strict";
import test from "node:test";
import { getTableConfig } from "drizzle-orm/pg-core";
import { account, session, user, verification } from "./schema/auth.ts";

test("auth tables keep session data behind row level security", () => {
  for (const table of [user, session, account, verification]) {
    const config = getTableConfig(table);
    assert.equal(config.enableRLS, true, config.name);
  }
});

test("auth foreign keys cascade when a user is deleted", () => {
  for (const table of [session, account]) {
    const foreignKeys = getTableConfig(table).foreignKeys;
    assert.equal(foreignKeys.length, 1);
    assert.equal(foreignKeys[0].onDelete, "cascade");
    assert.match(foreignKeys[0].getName(), /_user_id_user_id_fk$/);
  }
});
