import { extractTOC } from "./extractTOC";
import { calculateReadingTime } from "./reading-time";

import { extractHeadings } from "./toc";

import type { ParsedPost, Post } from "./types";

export function transformPost(post: ParsedPost): Post {
  return {
    slug: post.slug,
    metadata: post.frontmatter,
    content: post.content,
    headings: extractHeadings(post.content),
    toc: extractTOC(post.content),
    readingTime: calculateReadingTime(post.content),
    url: `/blog/${post.slug}`,
  };
}
