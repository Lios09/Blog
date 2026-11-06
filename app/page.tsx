import Link from "next/link";
import { BlogHeroBackground } from "@/components/blog-hero-background";
import AppleHelloEffectHero from "@/components/ui/apple-hello-effect-hero";
import { Highlighter } from "@/components/ui/highlighter";

export default async function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-zinc-50 font-sans dark:bg-black">
      <div className="absolute inset-0">
        <BlogHeroBackground />
      </div>

      <header className="pointer-events-none absolute inset-x-0 top-16 z-20 flex justify-center sm:top-20 md:top-24">
        <AppleHelloEffectHero />
      </header>

      <main className="absolute inset-x-0 top-70 z-20 flex flex-col items-center gap-2 text-center font-mono">
        <h1 className="font-normal">
          Thoughts,{" "}
          <Highlighter action="underline" color="#FF9800">
            <Link href="/blog">notes</Link>
          </Highlighter>
          , and things{" "}
          <Highlighter action="highlight" color="#87CEFA">
            worth keeping.
          </Highlighter>
        </h1>
        <p>Take a look at the blog.</p>
      </main>
    </div>
  );
}
