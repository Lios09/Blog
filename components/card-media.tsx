"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardPanel } from "@/components/ui/card";
import type { useRender } from "@base-ui/react";
import { BookmarkIcon, ClockIcon } from "lucide-react";

interface Article {
  slug: string;
  category: string;
  title: string;
  blurb: string;
  author: string;
  initials: string;
  read: string;
  hueA: string;
  hueB: string;
  pattern: "dots" | "stripes" | "rings";
  url: string;
}

export function ArticleCard({
  article,
  className,
  ...props
}: { article: Article } & useRender.ComponentProps<"div">) {
  return (
    <Card
      className="overflow-hidden transition-shadow hover:shadow-md"
      {...props}
    >
      <Cover article={article} />
      <CardPanel className="flex flex-1 flex-col">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="font-mono text-[10px] uppercase tracking-wider"
          >
            {article.category}
          </Badge>
          <span className="ml-auto inline-flex items-center gap-1 text-muted-foreground text-xs">
            <ClockIcon className="size-3" />
            {article.read}
          </span>
        </div>
        <div className="flex flex-1 flex-col">
          <h2 className="mt-3 font-heading font-semibold text-lg leading-snug">
            {article.title}
          </h2>
          <p className="mt-1.5 line-clamp-2 text-muted-foreground text-sm">
            {article.blurb}
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarFallback className="bg-muted text-[10px]">
                {article.initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-foreground text-xs">{article.author}</span>
          </div>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Save for later"
            className="text-muted-foreground"
          >
            <BookmarkIcon />
          </Button>
        </div>
      </CardPanel>
    </Card>
  );
}

function Cover({ article }: { article: Article }) {
  const bg = `radial-gradient(120% 100% at 20% 20%, ${article.hueA}, transparent 60%), radial-gradient(120% 100% at 80% 80%, ${article.hueB}, transparent 60%), color-mix(in srgb, var(--muted) 80%, transparent)`;
  return (
    <div className="relative aspect-video w-full" style={{ background: bg }}>
      <Pattern kind={article.pattern} />
    </div>
  );
}

function Pattern({ kind }: { kind: "dots" | "stripes" | "rings" }) {
  if (kind === "dots") {
    //
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 100 56"
        className="absolute inset-0 h-full w-full text-foreground/30 mix-blend-overlay"
      >
        {Array.from({ length: 40 }).map((_, i) => {
          const x = (i % 10) * 10 + 5;
          const y = Math.floor(i / 10) * 14 + 7;
          /* biome-ignore lint/suspicious/noArrayIndexKey: The array order is static */
          return <circle key={i} cx={x} cy={y} r={0.9} fill="currentColor" />;
        })}
      </svg>
    );
  }
  if (kind === "stripes") {
    return (
      <div
        aria-hidden
        className="absolute inset-0 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, color-mix(in srgb, currentColor 18%, transparent) 0 1px, transparent 1px 12px)",
        }}
      />
    );
  }
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 56"
      className="absolute inset-0 h-full w-full text-foreground/35 mix-blend-overlay"
    >
      {[8, 16, 24, 32].map((r) => (
        <circle
          key={r}
          cx={20}
          cy={56}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
        />
      ))}
    </svg>
  );
}
