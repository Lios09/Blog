"use client";

import { useEffect, useId, useRef, useState } from "react";

interface Props {
  chart: string;
}

export function Mermaid({ chart }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, "");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;

    let cancelled = false;

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        if (cancelled) return;

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
        });

        const { svg } = await mermaid.render(`mermaid-${id}`, chart);
        if (cancelled || !ref.current) return;
        ref.current.innerHTML = svg;
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (failed) {
    return <p className="my-8">Unable to render Mermaid diagram.</p>;
  }

  return (
    <div
      ref={ref}
      className="my-8 overflow-x-auto"
      role="img"
      aria-label="Diagram"
    />
  );
}
