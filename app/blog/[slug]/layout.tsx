import { LineNav } from "@/components/line-nav";
import { getAllPosts } from "@/content";

const BlogLayout = async ({
  children,
  params,
}: LayoutProps<"/blog/[slug]">) => {
  const { slug } = await params;

  const posts = getAllPosts();

  return (
    <div className="mx-auto min-h-svh bg-background px-6 font-mono">
      <div className="grid gap-x-8 md:items-start">
        <aside className="fixed top-30 left-6 max-w-60 self-start rounded-[0.75rem] border p-3 max-xl:hidden">
          <LineNav
            activeHref={`/blog/${slug}`}
            items={posts?.map(({ metadata, slug }) => ({
              title: metadata.title,
              href: `/blog/${slug}`,
            }))}
          />
        </aside>

        {children}
      </div>
    </div>
  );
};

export default BlogLayout;
