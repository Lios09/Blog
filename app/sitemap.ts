import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";
import { getAllPosts } from "@/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("days");

  const posts = getAllPosts();
  const postEntries = posts.map((post) => {
    // const daysSinceUpdate = Math.floor(
    //   (Date.now() - new Date(post.publishedAt).getTime()) /
    //     (1000 * 60 * 60 * 24),
    // );

    // let changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
    // let priority: number;

    // if (daysSinceUpdate < 7) {
    //   changeFrequency = "daily";
    //   priority = 0.9;
    // } else if (daysSinceUpdate < 30) {
    //   changeFrequency = "weekly";
    //   priority = 0.7;
    // } else {
    //   changeFrequency = "monthly";
    //   priority = 0.5;
    // }

    return {
      url: `https://mizenix.com/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      //   changeFrequency,
      //   priority,
    };
  });

  return [
    {
      url: "https://mizenix.com",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    ...postEntries,
  ];
}
