import assert from "node:assert/strict";
import test from "node:test";

import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";

import { remarkCode } from "./remark-code.ts";

async function compileMdx(source) {
  return String(
    await compile(source, {
      jsx: true,
      remarkPlugins: [remarkGfm, remarkCode],
    }),
  );
}

test("renders a mermaid fence as a diagram", async () => {
  const output = await compileMdx(`\`\`\`mermaid
flowchart TD
  A["a<br/>b"] --> B
\`\`\``);

  assert.match(output, /<Mermaid/);
  assert.match(output, /flowchart TD/);
  assert.match(output, /a<br\/>b/);
  assert.doesNotMatch(output, /<CodeBlock/);
});

test("leaves other fences as code blocks", async () => {
  const output = await compileMdx(`\`\`\`ts
const n = 1;
\`\`\``);

  assert.match(output, /<CodeBlock/);
  assert.doesNotMatch(output, /<Mermaid/);
});
