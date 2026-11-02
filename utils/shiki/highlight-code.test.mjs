import assert from "node:assert/strict";
import test from "node:test";

import { highlightCode } from "./highlight.ts";

test("renders highlighted HTML on the server", async () => {
  const html = await highlightCode("const value = 1;", "ts", {
    lineNumbers: true,
  });

  assert.match(html, /class="shiki /);
  assert.match(html, /shiki-line-numbers/);
  assert.match(html, /const/);
  assert.match(html, /value/);
});

test("renders text fences and unknown languages without throwing", async () => {
  const text = await highlightCode("plain words", "text");
  const unknown = await highlightCode("hello world", "not-a-language");

  assert.match(text, /class="shiki /);
  assert.match(text, /plain/);
  assert.match(unknown, /class="shiki /);
  assert.match(unknown, /hello/);
});
