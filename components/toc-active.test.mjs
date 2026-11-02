import assert from "node:assert/strict";
import test from "node:test";

import { resolveActiveHeadingIds } from "./toc-active.ts";

const ids = ["intro", "middle", "end"];

test("keeps every heading that is inside the viewport", () => {
  const active = resolveActiveHeadingIds(
    ids,
    new Set(["intro", "middle"]),
    new Map([
      ["intro", 0],
      ["middle", 40],
      ["end", 800],
    ]),
  );

  assert.deepEqual([...active], ["intro", "middle"]);
});

test("keeps the last heading that scrolled above the viewport", () => {
  const active = resolveActiveHeadingIds(
    ids,
    new Set(),
    new Map([
      ["intro", -1200],
      ["middle", -40],
      ["end", 900],
    ]),
  );

  assert.deepEqual([...active], ["middle"]);
});

test("keeps the first heading before any heading has been reached", () => {
  const active = resolveActiveHeadingIds(
    ids,
    new Set(),
    new Map([
      ["intro", 80],
      ["middle", 400],
      ["end", 900],
    ]),
  );

  assert.deepEqual([...active], ["intro"]);
});
