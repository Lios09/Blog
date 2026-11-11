"use client";

import { usePathname } from "next/navigation";

import { LineNav, type LineNavItem } from "@/components/line-nav";

export function PostLineNav({ items }: { items: LineNavItem[] }) {
  const pathname = usePathname();
  const onPost = pathname.startsWith("/blog/") && pathname !== "/blog";

  if (!onPost) {
    return null;
  }

  return (
    <aside className="fixed top-30 left-6 w-max max-w-50 self-start rounded-[0.75rem] border p-3 font-mono max-xl:hidden">
      <LineNav activeHref={pathname} items={items} />
    </aside>
  );
}
