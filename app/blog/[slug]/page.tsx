import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostContent } from "@/components/blog/post-content";
import { PostHeader } from "@/components/blog/post-header";
import { RelatedPosts } from "@/components/blog/related-posts";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { SITE_INFO } from "@/config/site";
import { getAllPosts, getPostBySlug } from "@/content";

import { getRelatedPosts } from "@/content/related";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

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
          width: 1280,
          height: 720,
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

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="grid lg:gap-6">
        {/* <div className="grid lg:grid-cols-[1fr_100px] lg:gap-6"> */}
        <article className="min-w-0 max-w-3xl">
          <PostHeader post={post} />

          <div className="mt-12">
            <PostContent source={post.content} />
          </div>

          <RelatedPosts posts={relatedPosts} />
        </article>

        <aside className="fixed top-[15%] right-0 hidden lg:block">
          <TableOfContents headings={post.headings} toc={post.toc} />
        </aside>
      </div>
    </main>
  );
}
