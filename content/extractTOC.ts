import { toString as mdastToString } from "mdast-util-to-string";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { createHeadingSlug } from "./slug";

export interface TOCItemType {
  title: string;
  url: string;
  depth: number;
}

export function extractTOC(content: string): TOCItemType[] {
  const tree = unified().use(remarkParse).parse(content);

  const items: TOCItemType[] = [];
  const slugCounts = new Map<string, number>();

  for (const node of tree.children) {
    if (node.type !== "heading") {
      continue;
    }

    const title = mdastToString(node);
    const baseSlug = createHeadingSlug(title);

    const count = slugCounts.get(baseSlug) ?? 0;
    slugCounts.set(baseSlug, count + 1);

    const id = count === 0 ? baseSlug : `${baseSlug}-${count}`;

    items.push({
      title,
      url: `#${id}`,
      depth: node.depth,
    });
  }

  return items;
}
