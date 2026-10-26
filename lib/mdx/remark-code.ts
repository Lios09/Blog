import type { Root } from "mdast";
import { visit } from "unist-util-visit";

export function remarkCode() {
  return (tree: Root) => {
    visit(tree, "code", (node, index, parent) => {
      if (index === undefined || !parent) {
        return;
      }

      const meta = [node.lang, node.meta].filter(Boolean).join(" ");

      parent.children[index] = {
        type: "mdxJsxFlowElement",
        name: "CodeBlock",
        attributes: [
          {
            type: "mdxJsxAttribute",
            name: "code",
            value: node.value,
          },
          {
            type: "mdxJsxAttribute",
            name: "meta",
            value: meta,
          },
        ],
        children: [],
      };
    });
  };
}
