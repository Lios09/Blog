import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";
import {
  CodeBlockContent,
  CodeBlockGroup,
  CodeBlockHeader,
  CodeBlockIcon,
  CodeShikiBlock,
} from "@/components/code-block/code-block";
import { CopyButton } from "@/components/mdx/copy-button";
import { cn } from "@/lib/cn";
import { reactToText } from "@/utils/react-to-text";

interface PreProps extends ComponentProps<"pre"> {
  ["data-language"]: string;
  ["data-title"]?: string;
}

const PreShikiComponent: MDXComponents = {
  pre: ({ children, ...props }: PreProps) => {
    const content = reactToText(children);
    const title = props["data-title"];
    const language = props["data-language"];
    return (
      <CodeShikiBlock className="group/code-block">
        {title && (
          <CodeBlockHeader>
            <CodeBlockGroup>
              <CodeBlockIcon language={language} />
              <span>{title}</span>
            </CodeBlockGroup>
            <CopyButton content={content} />
          </CodeBlockHeader>
        )}
        <CodeBlockContent className={cn(!title && "relative")}>
          {!title && (
            <CopyButton
              content={content}
              className="sticky top-3 right-3 z-50 float-right rounded-md text-neutral-950 opacity-0 transition-opacity hover:opacity-70 group-hover/code-block:opacity-100 dark:text-neutral-50"
            />
          )}
          <pre {...props}>{children}</pre>
        </CodeBlockContent>
      </CodeShikiBlock>
    );
  },
};

export { PreShikiComponent };
