"use client";

import { mount } from "ascii.rest";
import * as notFound from "ascii.rest/pieces/not-found";
import { useEffect, useRef } from "react";

const options = {
  code: "404",
  title: "page not found",
  message: "the page you asked for has moved or never existed",
};

const firstFrame = notFound.default(options)(0);

export function NotFoundArt() {
  const hostRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    return mount(el, notFound, options);
  }, []);

  return (
    <pre
      role="img"
      aria-label={notFound.meta.name}
      className="has-[[data-ascii]:not(:empty)]:[&_.not-found-still]:hidden"
    >
      <span className="not-found-still">{firstFrame}</span>
      <span ref={hostRef} data-ascii="" />
    </pre>
  );
}
