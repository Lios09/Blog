import GithubSlugger from "github-slugger";
import type { Heading as MdastHeading, Root } from "mdast";
import { toString as mdastToString } from "mdast-util-to-string";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import type { Heading, TOCItemType } from "./types";

export function extractOutline(content: string): {
  toc: TOCItemType[];
  headings: Heading[];
} {
  const tree = unified().use(remarkParse).parse(content) as Root;
  const slugger = new GithubSlugger();
  const toc: TOCItemType[] = [];
  const headings: Heading[] = [];

  visit(tree, "heading", (node: MdastHeading) => {
    const title = mdastToString(node);
    const id = slugger.slug(title);

    toc.push({
      title,
      url: `#${id}`,
      depth: node.depth,
    });

    if (node.depth === 2 || node.depth === 3) {
      headings.push({
        id,
        text: title,
        level: node.depth,
      });
    }
  });

  return { toc, headings };
}

export function extractTOC(content: string): TOCItemType[] {
  return extractOutline(content).toc;
}

export function extractHeadings(content: string): Heading[] {
  return extractOutline(content).headings;
}
