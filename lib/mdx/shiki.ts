import { createHighlighter, type Highlighter } from "shiki";

let highlighter: Highlighter | undefined;

export async function getHighlighter() {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ["github-light", "github-dark"],

      langs: [
        "typescript",
        "tsx",
        "javascript",
        "jsx",
        "json",
        "bash",
        "shellscript",
        "css",
        "html",
        "markdown",
        "mdx",
        "yaml",
        "sql",
        "python",
        "go",
        "rust",
      ],
    });
  }

  return highlighter;
}
