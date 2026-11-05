import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  getPostSource,
  isSafePostSlug,
  resetPostsDirectory,
  setPostsDirectory,
} from "./repository.ts";

test("isSafePostSlug accepts plain hyphenated slugs", () => {
  assert.equal(isSafePostSlug("hello-world"), true);
  assert.equal(isSafePostSlug("pando-git-packfile-uri"), true);
});

test("isSafePostSlug rejects path traversal and odd segments", () => {
  assert.equal(isSafePostSlug("../secrets"), false);
  assert.equal(isSafePostSlug("foo/bar"), false);
  assert.equal(isSafePostSlug("foo\\bar"), false);
  assert.equal(isSafePostSlug(""), false);
  assert.equal(isSafePostSlug(".hidden"), false);
});

test("getPostSource ignores traversal-style slugs", (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "blog-posts-"));
  setPostsDirectory(directory);
  t.after(() => {
    resetPostsDirectory();
    fs.rmSync(directory, { recursive: true, force: true });
  });

  const outside = path.join(directory, "..", "outside.mdx");
  fs.writeFileSync(outside, "# outside\n");

  assert.equal(getPostSource("../outside"), null);
  assert.equal(getPostSource("..%2Foutside"), null);
});
