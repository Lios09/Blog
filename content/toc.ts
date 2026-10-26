import { toString as mdastToString } from "mdast-util-to-string";
import remarkParse from "remark-parse";
import { unified } from "unified";

import { createHeadingSlug } from "./slug";

import type { Heading } from "./types";

export function extractHeadings(content: string): Heading[] {
  const tree = unified().use(remarkParse).parse(content);

  const headings: Heading[] = [];

  const slugCounts = new Map<string, number>();

  for (const node of tree.children) {
    if (node.type !== "heading" || (node.depth !== 2 && node.depth !== 3)) {
      continue;
    }

    const text = mdastToString(node);

    const baseSlug = createHeadingSlug(text);

    const count = slugCounts.get(baseSlug) ?? 0;

    slugCounts.set(baseSlug, count + 1);

    const id = count === 0 ? baseSlug : `${baseSlug}-${count}`;

    headings.push({
      id,
      text,
      level: node.depth,
    });
  }

  return headings;
}
