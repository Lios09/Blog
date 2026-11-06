import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostContent } from "@/components/blog/post-content";
import { PostHeader } from "@/components/blog/post-header";
import { RelatedPosts } from "@/components/blog/related-posts";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { LineNav } from "@/components/line-nav";
import { OG_IMAGE, SITE_INFO } from "@/config/site";
import { getAllPosts, getPostBySlug } from "@/content";
import { getRelatedPosts } from "@/content/related";

function postContainsMath(source: string) {
  const prose = source.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");

  if (prose.includes("<MathLatex")) return true;
  if (/\$\$[\s\S]+?\$\$/.test(prose)) return true;
  return /(?<!\$)\$(?!\$)(?:\\.|[^$\n])+?\$(?!\$)/.test(prose);
}

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

// The article is the page. Awaiting `params` here is the content, not a hole
// around an instant shell.
export const instant = true;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const post = getPostBySlug(slug);

  if (!post) {
    return {};
  }

  const coverFile = post.metadata.cover
    ? path.join(
        process.cwd(),
        "public",
        post.metadata.cover.replace(/^\/+/, ""),
      )
    : null;
  const image =
    post.metadata.cover && coverFile && existsSync(coverFile)
      ? { url: post.metadata.cover, alt: post.metadata.title }
      : {
          url: SITE_INFO.ogImage,
          width: OG_IMAGE.width,
          height: OG_IMAGE.height,
          alt: post.metadata.title,
        };

  return {
    title: post.metadata.title,
    description: post.metadata.description,
    alternates: {
      canonical: `/blog/${slug}`,
      types: {
        "application/rss+xml": "/rss",
      },
    },
    openGraph: {
      type: "article",
      title: post.metadata.title,
      description: post.metadata.description,
      publishedTime: post.metadata.date.toISOString(),
      modifiedTime: post.metadata.updated?.toISOString(),
      tags: post.metadata.tags,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metadata.title,
      description: post.metadata.description,
      images: [image.url],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;

  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = getAllPosts();

  const relatedPosts = getRelatedPosts(post, allPosts);
  const mathStyles = postContainsMath(post.content)
    ? await import("@/components/mdx/katex-styles").then(({ KatexStyles }) => (
        <KatexStyles />
      ))
    : null;

  return (
    <>
      <aside className="fixed top-30 left-6 w-max max-w-50 self-start rounded-[0.75rem] border p-3 max-xl:hidden">
        <LineNav
          activeHref={`/blog/${slug}`}
          items={allPosts?.map(({ metadata, slug: postSlug }) => ({
            title: metadata.title,
            href: `/blog/${postSlug}`,
          }))}
        />
      </aside>
      <article className="mx-auto max-w-6xl px-6 py-8">
        {mathStyles}
        <div className="grid lg:gap-6">
          <article className="min-w-0 max-w-3xl">
            <PostHeader post={post} />

            <div className="mt-12">
              <PostContent source={post.content} />
            </div>

            <RelatedPosts posts={relatedPosts} />
          </article>

          <aside className="fixed top-[15%] right-0 hidden lg:block">
            <TableOfContents toc={post.toc} />
          </aside>
        </div>
      </article>
    </>
  );
}
