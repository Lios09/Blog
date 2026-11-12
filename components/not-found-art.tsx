"use client";

import { mount } from "ascii.rest";
import * as notFound from "ascii.rest/pieces/not-found";
import { useEffect, useRef } from "react";

const options = {
  code: "404",
  title: "page not found",
  message: "the page you asked for has moved or never existed",
};

export function NotFoundArt() {
  const ref = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return mount(el, notFound, options);
  }, []);

  return (
    <pre ref={ref} role="img" aria-label={notFound.meta.name}>
      {notFound.default(options)(0)}
    </pre>
  );
}
