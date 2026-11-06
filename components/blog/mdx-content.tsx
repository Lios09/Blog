import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { remarkCallout } from "@/lib/mdx/remark-callout";
import { remarkCode } from "@/lib/mdx/remark-code";
import { mdxComponents } from "@/mdx-components";

interface Props {
  source: string;
}

/** Compile a trusted post string into an MDX React Server Component. */
export async function MdxContent({ source }: Props) {
  const { default: MDXContent } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm, remarkCallout, remarkCode, remarkMath],
    rehypePlugins: [rehypeSlug, rehypeKatex],
  });

  return <MDXContent components={mdxComponents} />;
}
