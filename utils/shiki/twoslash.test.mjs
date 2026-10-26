import assert from "node:assert/strict";
import test from "node:test";

import { highlight, Themes } from "./highlight.ts";
import { highlightTwoslash, isTwoslashCode } from "./twoslash.ts";

test("only enables Twoslash for explicitly marked TypeScript blocks", () => {
  assert.equal(isTwoslashCode("ts", "ts twoslash"), true);
  assert.equal(isTwoslashCode("tsx", "tsx twoslash title=Component"), true);
  assert.equal(isTwoslashCode("ts", "ts title=Example"), false);
  assert.equal(isTwoslashCode("sql", "sql twoslash"), false);
});

test("renders Twoslash query information as a portal-ready popup", async () => {
  const highlighter = await highlight();
  const html = highlightTwoslash(
    highlighter,
    `const greeting = "hello";
greeting;
// ^?`,
    "ts",
    { light: Themes.light, dark: Themes.dark },
  );

  assert.match(
    html,
    /<pre class="shiki shiki-themes one-light one-dark-pro twoslash lsp shiki-line-numbers"/,
  );
  assert.doesNotMatch(html, /class="[^"]*,[^"]*"/);
  assert.match(html, /twoslash-query-persisted/);
  assert.doesNotMatch(html, /twoslash-query-line/);
  assert.match(html, /twoslash-popup-code/);
  assert.match(html, /"hello"/);
});
