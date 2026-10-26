import matter from "gray-matter";

import { postSchema } from "./schema";

import type { ParsedPost } from "./types";

export function parsePost(slug: string, source: string): ParsedPost {
  const { data, content } = matter(source);

  const frontmatter = postSchema.parse(data);

  return {
    slug,
    frontmatter,
    content,
  };
}
