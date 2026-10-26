interface AnchorRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface PopoverSize {
  width: number;
  height: number;
}

interface ViewportSize {
  width: number;
  height: number;
}

interface PopoverPosition {
  top: number;
  left: number;
  side: "top" | "bottom";
}

const POPOVER_GAP = 8;
const VIEWPORT_PADDING = 8;

export function getTwoslashPopoverPosition(
  anchor: AnchorRect,
  popover: PopoverSize,
  viewport: ViewportSize,
): PopoverPosition {
  const maxLeft = Math.max(
    VIEWPORT_PADDING,
    viewport.width - popover.width - VIEWPORT_PADDING,
  );
  const left = Math.min(Math.max(anchor.left, VIEWPORT_PADDING), maxLeft);
  const bottomTop = anchor.bottom + POPOVER_GAP;
  const topTop = anchor.top - popover.height - POPOVER_GAP;
  const fitsBelow =
    bottomTop + popover.height <= viewport.height - VIEWPORT_PADDING;
  const fitsAbove = topTop >= VIEWPORT_PADDING;

  if (fitsBelow || !fitsAbove) {
    return {
      top: Math.min(
        Math.max(bottomTop, VIEWPORT_PADDING),
        Math.max(
          VIEWPORT_PADDING,
          viewport.height - popover.height - VIEWPORT_PADDING,
        ),
      ),
      left,
      side: "bottom",
    };
  }

  return { top: topTop, left, side: "top" };
}
