import { calculateReadingTime } from "./reading-time";
import { extractOutline } from "./toc";

import type { ParsedPost, Post } from "./types";

export function transformPost(post: ParsedPost): Post {
  const outline = extractOutline(post.content);

  return {
    slug: post.slug,
    metadata: post.frontmatter,
    content: post.content,
    headings: outline.headings,
    toc: outline.toc,
    readingTime: calculateReadingTime(post.content),
    url: `/blog/${post.slug}`,
  };
}
