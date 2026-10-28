import type { Metadata } from "next";
import { ThemeSwitcher } from "@/components/theme-switcher";

export const metadata: Metadata = {
  title: "Blog",
  description: "zx's Blog",
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
