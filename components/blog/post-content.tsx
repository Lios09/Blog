import { MdxContent } from "./mdx-content";

export function PostContent({ source }: { source: string }) {
  return (
    <div
      data-slot="prose"
      className={
        "prose prose-paper prose-zinc dark:prose-invert max-w-none font-mono"
      }
    >
      <MdxContent source={source} />
    </div>
  );
}
