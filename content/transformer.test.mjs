import assert from "node:assert/strict";
import test from "node:test";

import { transformPost } from "./transformer.ts";

function postWithDate(date) {
  return {
    slug: "missing-date",
    frontmatter: {
      title: "Missing date",
      description: "No date",
      date,
      author: "Your Name",
      tags: [],
      published: true,
      featured: false,
    },
    content: "Hello",
  };
}

test("transformPost uses an empty publishedAt when the frontmatter date is missing", () => {
  assert.equal(transformPost(postWithDate(null)).publishedAt, "");
  assert.equal(transformPost(postWithDate(undefined)).publishedAt, "");
});
