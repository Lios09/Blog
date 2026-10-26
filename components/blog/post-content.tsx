import { MdxContent } from "./mdx-content";

export function PostContent({ source }: { source: string }) {
  return (
    <div
      data-slot="prose"
      className={
        "prose max-w-none font-mono prose-paper prose-zinc dark:prose-invert"
      }
    >
      <MdxContent source={source} />
    </div>
  );
}
