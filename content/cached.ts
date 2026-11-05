import { cacheLife, cacheTag } from "next/cache";

import { getAllPosts, getPostBySlug } from "./index";
import { getRelatedPosts } from "./related";

import type { Post } from "./types";

export async function getCachedAllPosts(): Promise<Post[]> {
  "use cache";
  cacheLife("days");
  cacheTag("blog-posts");

  return getAllPosts();
}

export async function getCachedPostBySlug(slug: string): Promise<Post | null> {
  "use cache";
  cacheLife("days");
  cacheTag("blog-posts", `blog-post-${slug}`);

  return getPostBySlug(slug);
}

export async function getCachedRelatedPosts(slug: string): Promise<Post[]> {
  "use cache";
  cacheLife("days");
  cacheTag("blog-posts", `blog-post-${slug}`);

  const post = getPostBySlug(slug);

  if (!post) {
    return [];
  }

  return getRelatedPosts(post, getAllPosts());
}
