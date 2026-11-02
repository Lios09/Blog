import { parseCodeMeta } from "@/lib/mdx/code";
import { highlight, highlightCode, Themes } from "@/utils/shiki/highlight";
import { highlightTwoslash, isTwoslashCode } from "@/utils/shiki/twoslash";
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
  const highlightedHtml = usesTwoslash
    ? highlightTwoslash(await highlight(), code, language, {
        light: Themes.light,
        dark: Themes.dark,
      })
    : await highlightCode(code, language, { lineNumbers: true });

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
        {usesTwoslash ? (
          <TwoslashCode html={highlightedHtml} />
        ) : (
          <div
            className="w-full overflow-x-auto"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki generates this HTML from trusted local MDX code.
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        )}
      </CodeBlockContent>
    </CodeShikiBlock>
  );
}
