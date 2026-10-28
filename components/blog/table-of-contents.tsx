import type { Heading } from "@/content/types";
import type { TOCItemType } from "../toc-minimap";
import { TOCMinimap } from "../toc-minimap";

interface Props {
  headings: Heading[];
  toc: TOCItemType[];
}

export function TableOfContents({ headings, toc }: Props) {
  if (!headings.length) {
    return null;
  }

  return (
    <div className="sticky top-[35%] items-start">
      <TOCMinimap items={toc} />
    </div>
  );
}
