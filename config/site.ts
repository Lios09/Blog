const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export const SITE_INFO = {
  name: "zenix Leo",
  url: siteUrl,
  ogImage: "/og-image.jpg",
  description:
    "A blog about my thoughts, notes, and things I learn along the way.",
  keywords: "blog, thoughts, notes, learning",
};
