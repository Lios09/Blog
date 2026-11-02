import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { getAllPosts, getPostBySlug } from "./index.ts";
import { resetPostsDirectory, setPostsDirectory } from "./repository.ts";

const slug = "test-unpublished-draft";

test("getPostBySlug does not return unpublished posts", (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "blog-posts-"));
  setPostsDirectory(directory);
  t.after(() => {
    resetPostsDirectory();
    fs.rmSync(directory, { recursive: true, force: true });
  });

  fs.writeFileSync(
    path.join(directory, `${slug}.mdx`),
    `---
title: "Hidden draft"
description: "This draft should not be readable by slug."
date: "2026-01-01"
published: false
---

# Hidden draft
`,
  );

  assert.equal(getPostBySlug(slug), null);
  assert.equal(
    getAllPosts().some((post) => post.slug === slug),
    false,
  );
  assert.equal(
    fs.existsSync(path.join(process.cwd(), "content/posts", `${slug}.mdx`)),
    false,
  );
});
