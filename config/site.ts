export const SITE_INFO = {
  name: "zenix Leo",
  url:
    process.env.NODE_ENV === "development"
      ? ""
      : `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL}`,
  ogImage: "/og-image.png",
  description:
    "A blog about my thoughts, notes, and things I learn along the way.",
  keywords: "blog, thoughts, notes, learning",
};
