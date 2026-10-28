import type { Route } from "next";
import Link from "next/link";
import type { Post } from "@/content/types";

interface Props {
  post: Post;
}

export function PostCard({ post }: Props) {
  return (
    <article>
      <Link href={post.url as Route} className="group">
        <h2 className="font-semibold text-2xl tracking-tight group-hover:underline">
          {post.metadata.title}
        </h2>
      </Link>

      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        {post.metadata.description}
      </p>

      <div className="mt-4 flex gap-3 text-sm text-zinc-500">
        <time>{post.metadata.date.toLocaleDateString()}</time>

        <span>·</span>

        <span>{post.readingTime.text}</span>
      </div>
    </article>
  );
}
