import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { getAllPosts, getPostBySlug } from "./index.ts";

const slug = "test-unpublished-draft";
const file = path.join(process.cwd(), "content/posts", `${slug}.mdx`);

test("getPostBySlug does not return unpublished posts", (t) => {
  fs.writeFileSync(
    file,
    `---
title: "Hidden draft"
description: "This draft should not be readable by slug."
date: "2026-01-01"
published: false
---

# Hidden draft
`,
  );
  t.after(() => {
    fs.rmSync(file, { force: true });
  });

  assert.equal(getPostBySlug(slug), null);
  assert.equal(
    getAllPosts().some((post) => post.slug === slug),
    false,
  );
});
