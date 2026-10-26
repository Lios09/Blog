export interface CodeMeta {
  language: string;
  title?: string;
  highlightLines: number[];
}

export function parseCodeMeta(value?: string): CodeMeta {
  if (!value) {
    return {
      language: "text",
      highlightLines: [],
    };
  }

  const language = value.match(/^[^\s{]+/)?.[0] ?? "text";

  const title = value.match(/title="([^"]+)"/)?.[1];

  const highlightMatch = value.match(/\{([^}]+)\}/)?.[1];

  const highlightLines = highlightMatch ? parseLineRanges(highlightMatch) : [];

  return {
    language,
    title,
    highlightLines,
  };
}

function parseLineRanges(input: string) {
  const result: number[] = [];

  for (const part of input.split(",")) {
    if (part.includes("-")) {
      const [start, end] = part.split("-").map(Number);

      for (let i = start; i <= end; i++) {
        result.push(i);
      }
    } else {
      result.push(Number(part));
    }
  }

  return result;
}
