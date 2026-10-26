import type { Post } from "./types";

export function getRelatedPosts(current: Post, posts: Post[], limit = 3) {
  return posts
    .filter((post) => post.slug !== current.slug)
    .map((post) => {
      const commonTags = post.metadata.tags.filter((tag) =>
        current.metadata.tags.includes(tag),
      );

      let score = commonTags.length;

      if (
        current.metadata.category &&
        current.metadata.category === post.metadata.category
      ) {
        score += 2;
      }

      return {
        post,
        score,
      };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post }) => post);
}
