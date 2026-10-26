import { fontVariables } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import "./globals.css";

// const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "Code, Curiosity & Everything Between",
    template: "%s | Digital Garden",
  },
  description:
    "Part lab notebook, part idea garden. Exploring code, AI, strange ideas, and the little things in life. Still compiling...",
  applicationName: "zx's Garden",
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
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
