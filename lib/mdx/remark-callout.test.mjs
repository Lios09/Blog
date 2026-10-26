import assert from "node:assert/strict";
import test from "node:test";

import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";

import { remarkCallout } from "./remark-callout.ts";

async function compileMdx(source) {
  return String(
    await compile(source, {
      jsx: true,
      remarkPlugins: [remarkGfm, remarkCallout],
    }),
  );
}

test("converts a GitHub warning with a custom title and keeps its list", async () => {
  const output = await compileMdx(`> [!WARNING] Caveats
>
> - First warning
> - Second warning`);

  assert.match(output, /<Callout type="warning" title="Caveats">/);
  assert.match(output, /First warning/);
  assert.match(output, /Second warning/);
  assert.doesNotMatch(output, /\[!WARNING\]/);
});

test("maps GitHub alert types and supplies their default titles", async () => {
  const cases = [
    ["NOTE", "info", "Note"],
    ["TIP", "info", "Tip"],
    ["IMPORTANT", "info", "Important"],
    ["WARNING", "warning", "Warning"],
    ["CAUTION", "danger", "Caution"],
  ];

  for (const [marker, type, title] of cases) {
    const output = await compileMdx(`> [!${marker}]\n> Alert body`);

    assert.match(
      output,
      new RegExp(`<Callout type="${type}" title="${title}">`),
    );
  }
});

test("leaves ordinary blockquotes unchanged", async () => {
  const output = await compileMdx("> An ordinary quote");

  assert.match(output, /<_components\.blockquote>/);
  assert.doesNotMatch(output, /<Callout/);
});
