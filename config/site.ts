const SELF_HOSTED_URL = "https://blog.mizenix.com";

/** Open Graph image dimensions — keep in sync with `public/og-image.jpg`. */
export const OG_IMAGE = {
  path: "/og-image.jpg",
  width: 1200,
  height: 630,
} as const;

export function siteUrl(env: NodeJS.ProcessEnv = process.env): string {
  const explicit = env.SITE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const vercelHost =
    env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || env.VERCEL_URL?.trim();

  if (vercelHost) {
    return `https://${vercelHost.replace(/\/$/, "")}`;
  }

  return SELF_HOSTED_URL;
}

export const SITE_INFO = {
  name: "zenix Leo",
  url: siteUrl(),
  ogImage: OG_IMAGE.path,
  description:
    "A blog about my thoughts, notes, and things I learn along the way.",
  keywords: "blog, thoughts, notes, learning",
};
