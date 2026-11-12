import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { OG_IMAGE } from "@/config/site";
import { getPostBySlug } from "@/content";
import { BlogOgCard } from "@/lib/og/blog-card";
import { ogFonts } from "@/lib/og/fonts";
import { formatDate } from "@/lib/utils";

export const size = { width: OG_IMAGE.width, height: OG_IMAGE.height };
export const contentType = "image/png";

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  return [
    {
      id: "card",
      alt: post?.metadata.title ?? "Blog",
      size,
      contentType,
    },
  ];
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return new ImageResponse(
    <BlogOgCard
      title={post.metadata.title}
      description={post.metadata.description}
      category={post.metadata.category}
      date={formatDate(post.metadata.date)}
      detail={post.readingTime.text}
    />,
    {
      ...size,
      fonts: ogFonts,
    },
  );
}
