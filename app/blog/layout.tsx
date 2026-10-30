import type { Metadata } from "next";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SITE_INFO } from "@/config/site";

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
    images: [
      {
        url: SITE_INFO.ogImage,
        width: 1280,
        height: 720,
        alt: "Hello — Thoughts, notes, and things worth keeping.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog",
    description: SITE_INFO.description,
    images: [SITE_INFO.ogImage],
  },
};

const BlogLayout = ({ children }: LayoutProps<"/blog">) => {
  return (
    <main>
      {children}
      <div className="fixed top-3 right-3">
        <ThemeSwitcher />
      </div>
    </main>
  );
};

export default BlogLayout;
