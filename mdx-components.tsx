import type { MDXComponents } from "mdx/types";

import { Callout } from "@/components/mdx/callout";
import { CodeBlock } from "@/components/mdx/code-block";
import { MathLatex } from "@/components/mdx/math";
import { Mermaid } from "@/components/mdx/mermaid";
import { PreShikiComponent } from "./components/code-block/mdx/pre-shiki";
import { Heading } from "./components/heading";

export const mdxComponents: MDXComponents = {
  h1: (props: React.ComponentProps<"h1">) => <Heading as="h1" {...props} />,
  h2: (props: React.ComponentProps<"h2">) => <Heading as="h2" {...props} />,
  h3: (props: React.ComponentProps<"h3">) => <Heading as="h3" {...props} />,
  h4: (props: React.ComponentProps<"h4">) => <Heading as="h4" {...props} />,
  h5: (props: React.ComponentProps<"h5">) => <Heading as="h5" {...props} />,
  h6: (props: React.ComponentProps<"h6">) => <Heading as="h6" {...props} />,
  Callout,
  Mermaid,
  MathLatex,
  CodeBlock,
  ...PreShikiComponent,
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
  return mdxComponents;
}
