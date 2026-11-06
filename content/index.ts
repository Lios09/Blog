import { parsePost } from "./parser";
import { getPostSlugs, getPostSource } from "./repository";
import { transformPost } from "./transformer";

import type { Post } from "./types";

export function getPostBySlug(slug: string): Post | null {
  const source = getPostSource(slug);

  if (!source) {
    return null;
  }

  const post = transformPost(parsePost(slug, source));

  if (!post.metadata.published) {
    return null;
  }

  return post;
}

export function getAllPosts() {
  return getPostSlugs()
    .map(getPostBySlug)
    .filter((post): post is Post => post !== null)
    .sort((a, b) => b.metadata.date.getTime() - a.metadata.date.getTime());
}

export function getPostsByTag(tag: string) {
  return getAllPosts().filter((post) => post.metadata.tags.includes(tag));
}

export function getAllTags() {
  const tags = new Set<string>();

  for (const post of getAllPosts()) {
    for (const tag of post.metadata.tags) {
      tags.add(tag);
    }
  }

  return Array.from(tags).sort();
}
