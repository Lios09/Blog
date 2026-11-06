export const instant = true;

const BlogLayout = ({ children }: LayoutProps<"/blog/[slug]">) => {
  return (
    <div className="mx-auto min-h-svh bg-background px-6 font-mono">
      <div className="grid gap-x-8 md:items-start">{children}</div>
    </div>
  );
};

export default BlogLayout;
