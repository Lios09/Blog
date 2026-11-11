import type { Metadata } from "next";
import { PostLineNav } from "@/components/blog/post-line-nav";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SITE_INFO } from "@/config/site";
import { getAllPosts } from "@/content";

export const metadata: Metadata = {
  title: "Blog",
  description: "zx's Blog",
  keywords: SITE_INFO.keywords,
  authors: [{ name: SITE_INFO.name }],
  alternates: {
    types: {
      "application/rss+xml": "/rss",
    },
  },
  openGraph: {
    title: "Blog",
    description: SITE_INFO.description,
    url: "/blog",
    siteName: SITE_INFO.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog",
    description: SITE_INFO.description,
  },
};

const BlogLayout = async ({ children }: LayoutProps<"/blog">) => {
  const items = getAllPosts().map(({ metadata, slug }) => ({
    title: metadata.title,
    href: `/blog/${slug}`,
  }));

  return (
    <div>
      <PostLineNav items={items} />
      {children}
      <div className="fixed top-3 right-3 flex items-center gap-2">
        <ThemeSwitcher />
      </div>
    </div>
  );
};

export default BlogLayout;
