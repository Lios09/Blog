"use client";

import { useTheme } from "next-themes";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
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
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const theme = mermaidTheme(resolvedTheme);

  useEffect(() => {
    const host = ref.current;
    if (!host || !theme) return;

    let cancelled = false;

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
        setFailed(false);
        setReady(true);
      } catch {
        if (cancelled || ref.current !== host) return;
        host.innerHTML = "";
        setReady(false);
        setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, id, theme]);

  return (
    <div
      className={cn(
        "not-prose my-8 overflow-x-auto",
        !ready && !failed && "min-h-64",
      )}
    >
      <div
        ref={ref}
        className="[&_svg]:h-auto [&_svg]:max-w-full"
        role="img"
        aria-label={chart}
        aria-hidden={ready ? undefined : true}
      />
      {failed ? <p>Unable to render Mermaid diagram.</p> : null}
      <pre
        hidden={!failed}
        className="overflow-x-auto whitespace-pre font-mono text-sm"
      >
        {chart}
      </pre>
      <noscript>
        <pre className="overflow-x-auto whitespace-pre font-mono text-sm">
          {chart}
        </pre>
      </noscript>
    </div>
  );
}
