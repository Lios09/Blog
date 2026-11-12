import { ImageResponse } from "next/og";
import { OG_IMAGE, SITE_INFO } from "@/config/site";
import { getAllPosts } from "@/content";
import { BlogOgCard } from "@/lib/og/blog-card";
import { ogFonts } from "@/lib/og/fonts";

export const alt = "Blog — zx's Garden";
export const size = { width: OG_IMAGE.width, height: OG_IMAGE.height };
export const contentType = "image/png";

export default function Image() {
  const count = getAllPosts().length;

  return new ImageResponse(
    <BlogOgCard
      title="Posts"
      description={SITE_INFO.description}
      detail={count === 1 ? "1 note" : `${count} notes`}
    />,
    {
      ...size,
      fonts: ogFonts,
    },
  );
}
