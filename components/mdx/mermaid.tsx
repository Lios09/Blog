"use client";

import mermaid from "mermaid";
import { useEffect, useId, useRef } from "react";

interface Props {
  chart: string;
}

export function Mermaid({ chart }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const id = useId().replace(/:/g, "");

  useEffect(() => {
    if (!ref.current) return;

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
    });

    mermaid
      .render(`mermaid-${id}`, chart)
      .then(({ svg }) => {
        if (ref.current) {
          ref.current.innerHTML = svg;
        }
      })
      .catch(() => {
        if (ref.current) {
          ref.current.textContent = "Unable to render Mermaid diagram.";
        }
      });
  }, [chart, id]);

  return <div ref={ref} className="my-8 overflow-x-auto" />;
}
