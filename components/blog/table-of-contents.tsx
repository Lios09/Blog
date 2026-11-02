import type { TOCItemType } from "../toc-minimap";
import { TOCMinimap } from "../toc-minimap";

interface Props {
  toc: TOCItemType[];
}

export function TableOfContents({ toc }: Props) {
  if (!toc.length) {
    return null;
  }

  return (
    <div className="sticky top-[35%] items-start">
      <TOCMinimap items={toc} />
    </div>
  );
}
