import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";
import { SITE_INFO } from "@/config/site";
import { getAllPosts } from "@/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("hours");

  const posts = getAllPosts();
  const postEntries = posts.map((post) => {
    return {
      url: `${SITE_INFO.url}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
    };
  });

  return [
    {
      url: SITE_INFO.url,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: `${SITE_INFO.url}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...postEntries,
  ];
}
