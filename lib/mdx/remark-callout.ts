import type { Blockquote, Paragraph, Root, Text } from "mdast";
import { visit } from "unist-util-visit";

const calloutTypes = {
  NOTE: { title: "Note", type: "info" },
  TIP: { title: "Tip", type: "info" },
  IMPORTANT: { title: "Important", type: "info" },
  WARNING: { title: "Warning", type: "warning" },
  CAUTION: { title: "Caution", type: "danger" },
} as const;

type CalloutMarker = keyof typeof calloutTypes;

const calloutMarkerPattern =
  /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:[ \t]+([^\n]*))?(?:\n|$)/;

function getCallout(
  node: Blockquote,
): { marker: CalloutMarker; title: string } | undefined {
  const firstChild = node.children[0];
  if (firstChild?.type !== "paragraph") {
    return;
  }

  const firstText = firstChild.children[0];
  if (firstText?.type !== "text") {
    return;
  }

  const match = calloutMarkerPattern.exec(firstText.value);
  if (!match) {
    return;
  }

  const marker = match[1] as CalloutMarker;
  const definition = calloutTypes[marker];
  const customTitle = match[2]?.trim();

  removeMarker(node, firstChild, firstText, match[0].length);

  return {
    marker,
    title: customTitle || definition.title,
  };
}

function removeMarker(
  node: Blockquote,
  paragraph: Paragraph,
  text: Text,
  markerLength: number,
) {
  const remainingText = text.value.slice(markerLength);

  if (remainingText) {
    text.value = remainingText;
    return;
  }

  paragraph.children.shift();
  if (paragraph.children.length === 0) {
    node.children.shift();
  }
}

export function remarkCallout() {
  return (tree: Root) => {
    visit(tree, "blockquote", (node, index, parent) => {
      if (index === undefined || !parent) {
        return;
      }

      const callout = getCallout(node);
      if (!callout) {
        return;
      }

      const definition = calloutTypes[callout.marker];

      parent.children[index] = {
        type: "mdxJsxFlowElement",
        name: "Callout",
        attributes: [
          {
            type: "mdxJsxAttribute",
            name: "type",
            value: definition.type,
          },
          {
            type: "mdxJsxAttribute",
            name: "title",
            value: callout.title,
          },
        ],
        children: node.children,
      };
    });
  };
}
