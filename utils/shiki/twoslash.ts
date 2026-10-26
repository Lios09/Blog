import { transformerTwoslash } from "@shikijs/twoslash";
import type { HighlighterCore } from "shiki/core";

export function isTwoslashCode(
  language: string,
  meta?: string,
): language is "ts" | "tsx" {
  return (
    (language === "ts" || language === "tsx") && /\btwoslash\b/.test(meta ?? "")
  );
}

export function highlightTwoslash(
  highlighter: HighlighterCore,
  code: string,
  language: "ts" | "tsx",
  themes: { light: string; dark: string },
) {
  return highlighter.codeToHtml(code, {
    lang: language,
    themes,
    transformers: [
      transformerTwoslash(),
      {
        name: "AddLineNumbers",
        pre(node) {
          const classNames = node.properties.class;
          node.properties.class = Array.isArray(classNames)
            ? [...classNames, "shiki-line-numbers"]
            : `${classNames ?? ""} shiki-line-numbers`.trim();
        },
      },
    ],
  });
}
