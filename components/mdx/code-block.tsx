import { parseCodeMeta } from "@/lib/mdx/code";
import type { Languages } from "@/utils/shiki/highlight";
import { highlight, Themes } from "@/utils/shiki/highlight";
import { highlightTwoslash, isTwoslashCode } from "@/utils/shiki/twoslash";
import { CodeblockShiki } from "../code-block/client/shiki";
import { TwoslashCode } from "../code-block/client/twoslash";
import {
  CodeBlockContent,
  CodeBlockGroup,
  CodeBlockHeader,
  CodeBlockIcon,
  CodeShikiBlock,
} from "../code-block/code-block";
import { CopyButton } from "./copy-button";

interface Props {
  code: string;
  meta?: string;
}

export async function CodeBlock({ code, meta }: Props) {
  "use cache";

  const { language, title } = parseCodeMeta(meta);
  const usesTwoslash = isTwoslashCode(language, meta);
  const twoslashHtml = usesTwoslash
    ? highlightTwoslash(await highlight(), code, language, {
        light: Themes.light,
        dark: Themes.dark,
      })
    : null;

  // const highlighter = await getHighlighter();

  // const html = highlighter.codeToHtml(code, {
  //   lang: language,
  //   themes: {
  //     light: "github-light",
  //     dark: "github-dark",
  //   },
  //   transformers: [
  //     {
  //       name: "line-numbers",
  //       line(node, line) {
  //         node.properties["data-line"] = line;
  //       },
  //       pre(node) {
  //         node.properties["data-code"] = "true";
  //       },
  //     },
  //     {
  //       name: "highlight-lines",
  //       line(node, line) {
  //         if (highlightLines.includes(line)) {
  //           node.properties["data-highlighted"] = "true";
  //         }
  //       },
  //     },
  //   ],
  // });

  return (
    <CodeShikiBlock>
      <CodeBlockHeader>
        <CodeBlockGroup>
          <CodeBlockIcon language={language} />
          <span>{title}</span>
        </CodeBlockGroup>
        <CopyButton content={code} />
      </CodeBlockHeader>
      <CodeBlockContent
        className={usesTwoslash ? "max-h-none overflow-y-visible" : undefined}
      >
        {twoslashHtml ? (
          <TwoslashCode html={twoslashHtml} />
        ) : (
          <CodeblockShiki
            lineNumbers
            language={language as Languages}
            code={code}
          />
        )}
      </CodeBlockContent>
    </CodeShikiBlock>
  );
}
