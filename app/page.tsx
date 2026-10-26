import { BlogHeroBackground } from "@/components/blog-hero-background";
import AppleHelloEffectHero from "@/components/ui/apple-hello-effect-hero";
import { Highlighter } from "@/components/ui/highlighter";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-zinc-50 font-sans dark:bg-black">
      {/* Animated greeting */}
      <header className="pointer-events-none absolute inset-x-0 top-16 z-20 flex justify-center sm:top-20 md:top-24">
        <AppleHelloEffectHero />
      </header>

      <div className="font-mono absolute inset-x-0 top-70 z-20 flex flex-col items-center text-center gap-2">
        <p>
          Thoughts,
          <Highlighter action="underline" color="#FF9800">
            <Link href={"/blog"}>notes</Link>
          </Highlighter>
          ,and things{" "}
          <Highlighter action="highlight" color="#87CEFA">
            worth keeping.
          </Highlighter>{" "}
        </p>
        <p>Take a look at the .</p>
      </div>

      {/* Main content */}
      <main className="flex min-h-screen flex-1 items-center justify-center">
        <BlogHeroBackground />
      </main>
    </div>
  );
}
