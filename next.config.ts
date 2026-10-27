import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  serverExternalPackages: ["@shikijs/twoslash"],
  reactCompiler: process.env.NODE_ENV === "production",
  cacheComponents: true,
  partialPrefetching: true,
  experimental: { inlineCss: true },
  compiler:
    process.env.NODE_ENV === "production"
      ? {
          removeConsole: {
            exclude: ["error"],
          },
        }
      : undefined,
  typedRoutes: true,
  // output: "standalone",
  env: {
    BUILD_TIMESTAMP: new Date().toISOString(),
  },
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: ["remarkGfm", "./lib/mdx/remark-code.ts"],
    rehypePlugins: ["rehypeSlug"],
  },
});

// Merge MDX config with Next.js config
export default withMDX(nextConfig);
