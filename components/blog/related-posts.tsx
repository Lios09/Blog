import type { Route } from "next";
import Link from "next/link";
import type { Post } from "@/content/types";

interface Props {
  posts: Post[];
}

export function RelatedPosts({ posts }: Props) {
  if (!posts.length) {
    return null;
  }

  return (
    <section className="mt-20 border-t pt-10">
      <h2 className="font-bold text-2xl">Related Posts</h2>

      <div className="mt-6 grid gap-6">
        {posts.map((post) => (
          <Link key={post.slug} href={post.url as Route} className="group">
            <h3 className="font-semibold group-hover:underline">
              {post.metadata.title}
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              {post.metadata.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
