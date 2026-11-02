import assert from "node:assert/strict";
import test from "node:test";

import { compile } from "@mdx-js/mdx";
import rehypeSlug from "rehype-slug";

import { extractHeadings, extractTOC } from "./toc.ts";

const source = `# compatibility_date

## Same Title

# **4. \`compatibility_date\`**

## Same Title
`;

test("heading links use the same ids as rehype-slug", async () => {
  const compiled = String(
    await compile(source, {
      jsx: true,
      rehypePlugins: [rehypeSlug],
    }),
  );
  const toc = extractTOC(source);
  const headings = extractHeadings(source);

  assert.deepEqual(
    toc.map((item) => item.url),
    [
      "#compatibility_date",
      "#same-title",
      "#4-compatibility_date",
      "#same-title-1",
    ],
  );

  for (const item of toc) {
    assert.match(compiled, new RegExp(`id="${item.url.slice(1)}"`));
  }

  assert.deepEqual(
    headings.map((heading) => heading.id),
    ["same-title", "same-title-1"],
  );
});
