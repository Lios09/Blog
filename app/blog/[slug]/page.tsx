import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostContent } from "@/components/blog/post-content";
import { PostHeader } from "@/components/blog/post-header";
import { RelatedPosts } from "@/components/blog/related-posts";
import { TableOfContents } from "@/components/blog/table-of-contents";
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

  return {
    title: post.metadata.title,
    description: post.metadata.description,
    openGraph: {
      type: "article",
      title: post.metadata.title,
      description: post.metadata.description,
      publishedTime: post.metadata.date.toISOString(),
      modifiedTime: post.metadata.updated?.toISOString(),
      tags: post.metadata.tags,
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

        <aside className="hidden fixed top-[15%] right-0 lg:block">
          <TableOfContents headings={post.headings} toc={post.toc} />
        </aside>
      </div>
    </main>
  );
}
