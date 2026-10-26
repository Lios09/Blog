import type { Post } from "@/content/types";
import { formatDate } from "@/lib/utils";

interface Props {
  post: Post;
}

export async function PostHeader({ post }: Props) {
  const { metadata, readingTime } = post;

  return (
    <header>
      {metadata.category && (
        <div className="mb-4 text-sm font-medium">{metadata.category}</div>
      )}

      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
        {metadata.title}
      </h1>

      <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
        {metadata.description}
      </p>

      <div className="mt-2 flex flex-wrap gap-4 text-sm text-zinc-500">
        <time dateTime={metadata.date.toISOString()}>
          {formatDate(metadata.date)}
        </time>

        <span>·</span>

        <span>{readingTime.text}</span>

        {metadata.author && (
          <>
            <span>·</span>
            <span>{metadata.author}</span>
          </>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {metadata.tags.map((tag) => (
          <span key={tag} className="rounded-full border px-3 py-1 text-xs">
            #{tag}
          </span>
        ))}
      </div>
    </header>
  );
}
