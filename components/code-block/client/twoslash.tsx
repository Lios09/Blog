"use client";

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { getTwoslashPopoverPosition } from "@/utils/shiki/twoslash-popover";

interface TwoslashCodeProps {
  html: string;
}

interface ActivePopover {
  html: string;
  trigger: HTMLElement;
}

interface PopoverPosition {
  top: number;
  left: number;
  side: "top" | "bottom";
}

const getTrigger = (root: HTMLElement, target: EventTarget | null) => {
  if (!(target instanceof Element)) return null;
  const trigger = target.closest<HTMLElement>(".twoslash-hover");
  return trigger && root.contains(trigger) ? trigger : null;
};

const getPopup = (trigger: HTMLElement) =>
  Array.from(trigger.children).find((child) =>
    child.classList.contains("twoslash-popup-container"),
  ) as HTMLElement | undefined;

export function TwoslashCode({ html }: TwoslashCodeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const persistentTriggerRef = useRef<HTMLElement | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activePopover, setActivePopover] = useState<ActivePopover | null>(
    null,
  );
  const [position, setPosition] = useState<PopoverPosition | null>(null);

  const cancelHide = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const showPopover = useCallback((trigger: HTMLElement) => {
    const popup = getPopup(trigger);
    if (!popup) return;

    setActivePopover((current) => {
      if (current?.trigger === trigger) return current;
      return { html: popup.innerHTML, trigger };
    });
  }, []);

  const restorePersistentPopover = useCallback(() => {
    const trigger = persistentTriggerRef.current;
    if (trigger?.isConnected) {
      showPopover(trigger);
      return;
    }
    setActivePopover(null);
  }, [showPopover]);

  const scheduleRestore = useCallback(() => {
    cancelHide();
    hideTimerRef.current = setTimeout(restorePersistentPopover, 120);
  }, [cancelHide, restorePersistentPopover]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const triggers = root.querySelectorAll<HTMLElement>(
      ".twoslash-hover:has(> .twoslash-popup-container)",
    );
    for (const trigger of triggers) {
      trigger.tabIndex = 0;
    }

    const persistentTrigger = root.querySelector<HTMLElement>(
      ".twoslash-query-persisted",
    );
    persistentTriggerRef.current = persistentTrigger;
    if (persistentTrigger) showPopover(persistentTrigger);

    const handlePointerOver = (event: PointerEvent) => {
      const trigger = getTrigger(root, event.target);
      if (!trigger || !getPopup(trigger)) return;
      cancelHide();
      showPopover(trigger);
    };

    const handlePointerOut = (event: PointerEvent) => {
      const trigger = getTrigger(root, event.target);
      if (!trigger) return;
      if (
        event.relatedTarget instanceof Node &&
        trigger.contains(event.relatedTarget)
      ) {
        return;
      }
      scheduleRestore();
    };

    const handleFocusIn = (event: FocusEvent) => {
      const trigger = getTrigger(root, event.target);
      if (!trigger || !getPopup(trigger)) return;
      cancelHide();
      showPopover(trigger);
    };

    const handleFocusOut = (event: FocusEvent) => {
      if (
        event.relatedTarget instanceof Node &&
        root.contains(event.relatedTarget)
      ) {
        return;
      }
      scheduleRestore();
    };

    root.addEventListener("pointerover", handlePointerOver);
    root.addEventListener("pointerout", handlePointerOut);
    root.addEventListener("focusin", handleFocusIn);
    root.addEventListener("focusout", handleFocusOut);

    return () => {
      cancelHide();
      root.removeEventListener("pointerover", handlePointerOver);
      root.removeEventListener("pointerout", handlePointerOut);
      root.removeEventListener("focusin", handleFocusIn);
      root.removeEventListener("focusout", handleFocusOut);
      persistentTriggerRef.current = null;
    };
  }, [cancelHide, scheduleRestore, showPopover]);

  const updatePosition = useCallback(() => {
    const popover = popoverRef.current;
    if (!activePopover || !popover || !activePopover.trigger.isConnected) {
      return;
    }

    const triggerRect = activePopover.trigger.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();
    const nextPosition = getTwoslashPopoverPosition(triggerRect, popoverRect, {
      width: window.innerWidth,
      height: window.innerHeight,
    });

    setPosition((current) => {
      if (
        current?.top === nextPosition.top &&
        current.left === nextPosition.left &&
        current.side === nextPosition.side
      ) {
        return current;
      }
      return nextPosition;
    });
  }, [activePopover]);

  useLayoutEffect(() => {
    if (!activePopover) {
      setPosition(null);
      return;
    }
    updatePosition();
  }, [activePopover, updatePosition]);

  useEffect(() => {
    if (!activePopover) return;
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [activePopover, updatePosition]);

  const popoverStyle: CSSProperties = {
    top: position?.top ?? 0,
    left: position?.left ?? 0,
    visibility: position ? "visible" : "hidden",
  };

  const handlePopoverPointerEnter = (_event: ReactPointerEvent) => {
    cancelHide();
  };

  return (
    <>
      <div
        ref={rootRef}
        className="twoslash-code w-full overflow-x-auto overflow-y-hidden"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki generates this HTML from trusted local MDX code.
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {activePopover &&
        createPortal(
          <div className="twoslash shiki twoslash-portal-root">
            <div
              ref={popoverRef}
              role="tooltip"
              data-side={position?.side}
              className="twoslash-popup-container twoslash-portal-popup"
              style={popoverStyle}
              onPointerEnter={handlePopoverPointerEnter}
              onPointerLeave={scheduleRestore}
              // biome-ignore lint/security/noDangerouslySetInnerHtml: This content comes from the trusted Shiki output above.
              dangerouslySetInnerHTML={{ __html: activePopover.html }}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
