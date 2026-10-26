import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { remarkCallout } from "@/lib/mdx/remark-callout";
import { remarkCode } from "@/lib/mdx/remark-code";
import { mdxComponents } from "@/mdx-components";

interface Props {
  source: string;
}

// const codeBlockMetadataTransformer: ShikiTransformer = {
//   name: "code-block-metadata",
//   pre(node) {
//     node.properties["data-language"] = this.options.lang;

//     const title = (this.options.meta as { title?: string } | undefined)?.title;
//     if (title) {
//       node.properties["data-title"] = title;
//     }
//   },
// };

/** Compile a trusted post string into an MDX React Server Component. */
export async function MdxContent({ source }: Props) {
  const { default: MDXContent } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm, remarkCallout, remarkCode],
    rehypePlugins: [
      rehypeSlug,
      // [
      //   rehypeShiki,
      //   {
      //     langs: [
      //       "html",
      //       "js",
      //       "ts",
      //       "tsx",
      //       "css",
      //       "bash",
      //       "json",
      //       "mdx",
      //       "go",
      //       "sql",
      //     ],
      //     themes: {
      //       light: "one-light",
      //       dark: "one-dark-pro",
      //     },
      //     defaultColor: false,
      //     defaultLanguage: "text",
      //     fallbackLanguage: "text",
      //     parseMetaString(metaString: string) {
      //       return { title: parseCodeMeta(metaString).title };
      //     },
      //     transformers: [codeBlockMetadataTransformer],
      //   },
      // ],
    ],
  });

  return <MDXContent components={mdxComponents} />;
}
