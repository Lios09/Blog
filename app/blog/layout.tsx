import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { ThemeSwitcher } from "@/components/theme-switcher";

export const metadata: Metadata = {
  title: "Blog",
  description: "zx's Blog",
};

const BlogLayout = ({ children }: LayoutProps<"/blog">) => {
  return (
    <main>
      <ThemeProvider
        enableSystem
        disableTransitionOnChange
        enableColorScheme
        storageKey="theme"
        defaultTheme="system"
        attribute="class"
      >
        {children}
        <div className="fixed top-3 right-3">
          <ThemeSwitcher />
        </div>
      </ThemeProvider>
    </main>
  );
};

export default BlogLayout;
