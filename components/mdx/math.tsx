import "katex/dist/katex.min.css";

import katex from "katex";

interface Props {
  children: string;
}

export function MathLatex({ children }: Props) {
  const html = katex.renderToString(children, {
    throwOnError: false,
    displayMode: true,
  });

  return (
    <div
      className="my-8 overflow-x-auto"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML has been sanitized with DOMPurify
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    />
  );
}
