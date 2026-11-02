"use client";

import { motion } from "motion/react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const lineVariants = {
  normal: { width: 24 },
  active: { width: 40 },
  hover: { width: 40 },
};

export type LineNavItem = {
  title: string;
  href: string;
};

export type LineNavProps = {
  className?: string;
  /** @fumadocsHref #linenavitem */
  items: LineNavItem[];
  /** Href of the active item. */
  activeHref?: string;
  /** Scroll the active item into view on mount. */
  scrollActiveIntoView?: boolean;
  /** Called when an item is clicked. */
  onItemClick?: (
    item: LineNavItem,
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => void;
};

export function LineNav({
  className,
  items,
  activeHref,
  scrollActiveIntoView = true,
  onItemClick,
}: LineNavProps) {
  const activeItemRef = useRef<HTMLAnchorElement | null>(null);
  const titleElements = useRef(new Map<string, HTMLElement>());
  const titleObserver = useRef<ResizeObserver | null>(null);
  const [truncatedHrefs, setTruncatedHrefs] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  useEffect(() => {
    if (scrollActiveIntoView) {
      activeItemRef.current?.scrollIntoView({ block: "center" });
    }
  }, [scrollActiveIntoView]);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      setTruncatedHrefs((current) => {
        const next = new Set(current);
        let changed = false;

        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          const href = element.dataset.navHref;
          if (!href) {
            continue;
          }

          const truncated = element.scrollWidth > element.clientWidth + 1;
          if (truncated === next.has(href)) {
            continue;
          }

          changed = true;
          if (truncated) {
            next.add(href);
          } else {
            next.delete(href);
          }
        }

        return changed ? next : current;
      });
    });

    titleObserver.current = observer;
    for (const element of titleElements.current.values()) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
      titleObserver.current = null;
    };
  }, []);

  const observeTitle = useCallback(
    (href: string, element: HTMLElement | null) => {
      const current = titleElements.current.get(href);
      if (current === element) {
        return;
      }

      if (current) {
        titleObserver.current?.unobserve(current);
        titleElements.current.delete(href);
      }

      if (!element) {
        setTruncatedHrefs((currentHrefs) => {
          if (!currentHrefs.has(href)) {
            return currentHrefs;
          }
          const next = new Set(currentHrefs);
          next.delete(href);
          return next;
        });
        return;
      }

      element.dataset.navHref = href;
      titleElements.current.set(href, element);
      titleObserver.current?.observe(element);
    },
    [],
  );

  return (
    <TooltipProvider delay={200}>
      <nav
        className={cn("flex w-full min-w-0 flex-col gap-2 py-5.25", className)}
        style={
          {
            "--line-nav-width": `${lineVariants.normal.width}px`,
          } as React.CSSProperties
        }
      >
        {items.map((item, index) => {
          const isActive = item.href === activeHref;

          return (
            <LineNavItem
              key={item.href}
              ref={isActive ? activeItemRef : undefined}
              title={item.title}
              href={item.href}
              active={isActive}
              truncated={truncatedHrefs.has(item.href)}
              isLast={index === items.length - 1}
              observeTitle={observeTitle}
              onClick={
                onItemClick ? (event) => onItemClick(item, event) : undefined
              }
            />
          );
        })}
      </nav>
    </TooltipProvider>
  );
}

const LineNavItem = memo(function LineNavItem({
  ref,
  title,
  href,
  active = false,
  truncated = false,
  isLast = false,
  observeTitle,
  onClick,
}: {
  ref?: React.Ref<HTMLAnchorElement>;
  title: string;
  href: string;
  active?: boolean;
  truncated?: boolean;
  isLast?: boolean;
  observeTitle: (href: string, element: HTMLElement | null) => void;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}) {
  const titleRef = useCallback(
    (element: HTMLSpanElement | null) => {
      observeTitle(href, element);
    },
    [href, observeTitle],
  );

  return (
    <>
      {/*
        Rendered as a plain anchor to stay framework-agnostic. For client-side
        navigation in Next.js, swap `motion.a` for `motion.create(Link)`
        (import Link from "next/link").
      */}
      <Tooltip disabled={!truncated}>
        <TooltipTrigger
          render={
            <motion.a
              ref={ref}
              aria-current={active ? "page" : undefined}
              className="group relative flex h-px w-full min-w-0 items-center gap-3 after:absolute after:top-1/2 after:left-0 after:size-full after:-translate-y-1/2 after:p-3.5"
              href={href}
              initial={false}
              animate={active ? "active" : "normal"}
              whileHover="hover"
              onClick={onClick}
            >
              <motion.span
                className="block h-px shrink-0 bg-foreground/20 transition-[background-color] ease-out group-hover:bg-foreground group-aria-[current=page]:bg-foreground"
                variants={lineVariants}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              />
              <span
                ref={titleRef}
                className="min-w-0 truncate text-muted-foreground text-sm transition-[color] ease-out group-hover:text-foreground group-aria-[current=page]:text-foreground"
              >
                {title}
              </span>
            </motion.a>
          }
        />
        <TooltipContent side="right" sideOffset={12} className="max-w-72">
          <span className="min-w-0 whitespace-normal text-left">{title}</span>
        </TooltipContent>
      </Tooltip>

      {!isLast && (
        <>
          <span className="block h-px w-(--line-nav-width) bg-foreground/20" />
          <span className="block h-px w-(--line-nav-width) bg-foreground/20" />
        </>
      )}
    </>
  );
});
