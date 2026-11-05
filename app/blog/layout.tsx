import type { Metadata } from "next";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { OG_IMAGE, SITE_INFO } from "@/config/site";

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
        width: OG_IMAGE.width,
        height: OG_IMAGE.height,
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

const BlogLayout = async ({ children }: LayoutProps<"/blog">) => {
  return (
    <main>
      {children}
      <div className="fixed top-3 right-3 flex items-center gap-2">
        {/* <Suspense fallback={<Spinner />}>
          <CurrentUser />
        </Suspense> */}
        <ThemeSwitcher />
      </div>
    </main>
  );
};

export default BlogLayout;
