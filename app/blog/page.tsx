import { TextRoll } from "@/components/text-roll";
import { Signature } from "@/components/ui/signature";
import { getAllPosts } from "@/content";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

const HomeBlog = () => {
  const posts = getAllPosts();

  return (
    <main className="flex flex-col text-text">
      <div className="mx-auto w-full max-w-4xl px-6 py-16 font-mono">
        <div className="mx-auto max-w-5xl">
          <header className="mb-8 animate-fade-in-up animate-fill-mode-both opacity-0">
            <h1 className="font-heading text-xl">Posts</h1>
            <p className="text-muted-foreground text-sm">
              Notes from the team on engineering, design, and product.
            </p>
            <p className="text-muted-foreground text-sm">
              thoughts on tech and content.
            </p>
          </header>

          <Signature
            key={"home"}
            text="Curiosity drives the code."
            fontSize={30}
            duration={1}
          />

          <div className="flex flex-col gap-1">
            {[...posts].map(({ metadata, slug }, i) => (
              <div
                className={`animate-fade-in-up opacity-0`}
                key={slug}
                style={{
                  animationDelay: `${(i + 1) * 0.05}s`,
                }}
              >
                <Link
                  href="/blog/[slug]"
                  as={`/blog/${slug}`}
                  className="group relative flex items-baseline justify-between gap-4 py-3"
                >
                  <span className="text-subtle transition-colors duration-200 group-hover:text-text">
                    <TextRoll
                      center
                      className="tracking-[-0.03em] transition-colors"
                    >
                      {metadata.title}
                    </TextRoll>
                  </span>
                  <span className="shrink-0 text-sm">
                    {formatDate(metadata.date)}
                  </span>
                  <span className="absolute bottom-2 left-0 h-px w-0 bg-line-30 transition-all duration-300 ease-out group-hover:w-full"></span>
                </Link>
              </div>
            ))}
          </div>

          {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(posts ?? []).map(({ metadata, readingTime, url, slug }) => (
            <ArticleCard
              article={{
                slug,
                category: metadata.tags[0],
                title: metadata.title,
                read: readingTime.text,
                hueA: "#fde68a",
                hueB: "#fb7185",
                pattern: "dots",
                initials: "A",
                author: metadata.author,
                blurb: metadata.description,
                url,
              }}
              key={url}
            />
          ))}
        </div> */}
        </div>
      </div>
    </main>
  );
};

export default HomeBlog;
