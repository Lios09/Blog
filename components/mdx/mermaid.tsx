"use client";

import { useTheme } from "next-themes";
import { useEffect, useId, useRef, useState } from "react";
import {
  mermaidSession,
  mermaidTheme,
  renderMermaidChart,
} from "./mermaid-config";

interface Props {
  chart: string;
}

export function Mermaid({ chart }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, "");
  const { resolvedTheme } = useTheme();
  const [failed, setFailed] = useState(false);
  const theme = mermaidTheme(resolvedTheme);

  useEffect(() => {
    const host = ref.current;
    if (!host || !theme) return;

    let cancelled = false;
    setFailed(false);

    (async () => {
      try {
        const svg = await renderMermaidChart({
          session: mermaidSession,
          theme,
          id: `mermaid-${id}`,
          chart,
          host,
        });
        if (cancelled || ref.current !== host) return;
        host.innerHTML = svg;
      } catch {
        if (cancelled || ref.current !== host) return;
        host.innerHTML = "";
        setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, id, theme]);

  return (
    <div className="my-8">
      {failed ? <p>Unable to render Mermaid diagram.</p> : null}
      <div
        ref={ref}
        className="overflow-x-auto [&_svg]:h-auto [&_svg]:max-w-full"
      />
    </div>
  );
}
