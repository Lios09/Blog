import type { Root } from "mdast";
import { visit } from "unist-util-visit";

export function remarkCode() {
  return (tree: Root) => {
    visit(tree, "code", (node, index, parent) => {
      if (index === undefined || !parent) {
        return;
      }

      if (node.lang?.toLowerCase() === "mermaid") {
        parent.children[index] = {
          type: "mdxJsxFlowElement",
          name: "Mermaid",
          attributes: [
            {
              type: "mdxJsxAttribute",
              name: "chart",
              value: node.value,
            },
          ],
          children: [],
        };
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
