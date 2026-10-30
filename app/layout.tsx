import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { SITE_INFO } from "@/config/site";
import { fontVariables } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "./globals.css";

import { Analytics } from "@vercel/analytics/next";

// const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_INFO.url),
  title: {
    default: "Code, Curiosity & Everything Between",
    template: "%s | Digital Garden",
  },
  description:
    "Part lab notebook, part idea garden. Exploring code, AI, strange ideas, and the little things in life. Still compiling...",
  applicationName: "zx's Garden",
  openGraph: {
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
    images: [SITE_INFO.ogImage],
  },
  keywords: [
    "Personal Blog",
    "Software Engineering",
    "Artificial Intelligence",
    "Programming",
    "Technology",
    "Life & Ideas",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", fontVariables, "font-sans")}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
