const SELF_HOSTED_URL = "https://mizenix.com";

function siteUrl(env: NodeJS.ProcessEnv = process.env): string {
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
  ogImage: "/og-image.jpg",
  description:
    "A blog about my thoughts, notes, and things I learn along the way.",
  keywords: "blog, thoughts, notes, learning",
};
