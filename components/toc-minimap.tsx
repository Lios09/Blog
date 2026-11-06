"use client";

import { useEffect, useMemo, useState } from "react";
import { resolveActiveHeadingIds } from "@/components/toc-active";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useSound } from "@/hooks/use-sound";
import { uMiniMapOpenSound } from "@/lib/u-mini-map-open";
import { cn } from "@/lib/utils";

export type TOCItemType = {
  title: React.ReactNode;
  url: string;
  depth: number;
};

export type TOCMinimapProps = {
  /** @fumadocsHref #tocitemtype */
  items: TOCItemType[];
  className?: string;
};

export function TOCMinimap({ items, className }: TOCMinimapProps) {
  const itemIds = useMemo(
    () => items.map((item) => item.url.replace("#", "")),
    [items],
  );

  const activeHeadings = useActiveHeading(itemIds);

  const [play] = useSound(uMiniMapOpenSound, { volume: 0.3 });

  if (!items.length) {
    return null;
  }

  return (
    <div className={cn("ml-auto w-18", className)}>
      <HoverCard
        onOpenChange={(open) => {
          if (open) play();
        }}
      >
        <HoverCardTrigger>
          <div className="flex max-h-[50dvh] flex-col gap-3 overflow-hidden py-3 pl-6 opacity-100 transition-opacity duration-200 data-popup-open:opacity-0">
            {items.map((item) => (
              <div
                key={item.url}
                data-depth={item.depth}
                data-active={activeHeadings.has(item.url.slice(1))}
                className={cn(
                  "h-0.5 w-6 shrink-0 rounded-xs bg-ring/50 transition-[background-color] duration-200",
                  "data-[depth=2]:ml-0 data-[depth=2]:w-6",
                  "data-[depth=3]:ml-2 data-[depth=3]:w-4",
                  "data-[depth=4]:ml-4 data-[depth=4]:w-2",
                  "data-[depth=5]:ml-6 data-[depth=5]:w-2",
                  "data-[depth=6]:ml-8 data-[depth=6]:w-2",
                  "data-active:bg-foreground",
                )}
              />
            ))}
          </div>
        </HoverCardTrigger>

        <HoverCardContent
          className="data-[side=left]:slide-in-from-right-3 data-[side=left]:slide-out-to-right-3 data-open:zoom-in-100 data-closed:zoom-out-100 w-56 overflow-hidden p-0 duration-200"
          align="start"
          alignOffset={0}
          side="left"
          sideOffset={-60}
        >
          <div className="flex max-h-[50dvh] overflow-y-auto overscroll-contain">
            <ul className="flex size-full flex-col px-6 py-4 text-sm">
              {items.map((item) => (
                <li key={item.url} className="flex py-1">
                  <a
                    href={item.url}
                    data-depth={item.depth}
                    data-active={activeHeadings.has(item.url.slice(1))}
                    className={cn(
                      "line-clamp-2 w-full transition-[color] duration-200",
                      "text-muted-foreground hover:text-foreground data-active:text-foreground",
                      "data-[depth=2]:pl-0",
                      "data-[depth=3]:pl-4 data-[depth=4]:pl-8",
                      "data-[depth=5]:pl-12 data-[depth=6]:pl-16",
                    )}
                    onClick={handleItemClick}
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}

export function useActiveHeading(itemIds: string[]) {
  // Shown until the observer reports what is actually on screen.
  const [activeIds, setActiveIds] = useState<Set<string>>(
    () => new Set(itemIds[0] ? [itemIds[0]] : []),
  );

  useEffect(() => {
    const elements = itemIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) {
      return;
    }

    const visibleIds = new Set<string>();

    // Headings inside the viewport stay active together. A long section can
    // leave none of them on screen; the last heading above the viewport then
    // stays current until the next one arrives.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleIds.add(entry.target.id);
          } else {
            visibleIds.delete(entry.target.id);
          }
        }

        const tops = new Map(
          elements.map((element) => [
            element.id,
            element.getBoundingClientRect().top,
          ]),
        );
        const nextIds = resolveActiveHeadingIds(itemIds, visibleIds, tops);

        setActiveIds((currentIds) => {
          if (
            nextIds.size === currentIds.size &&
            [...nextIds].every((id) => currentIds.has(id))
          ) {
            return currentIds;
          }

          return nextIds;
        });
      },
      { rootMargin: "0px", threshold: 0 },
    );

    for (const element of elements) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, [itemIds]);

  return activeIds;
}

function handleItemClick(e: React.MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  const url = e.currentTarget.getAttribute("href") ?? "";
  scrollToHeading(url);
}

function scrollToHeading(url: string) {
  history.pushState(null, "", url);
  document.getElementById(url.replace("#", ""))?.scrollIntoView({
    behavior: "smooth",
  });
}
