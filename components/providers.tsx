"use client";

import { useServerInsertedHTML } from "next/navigation";
import Script from "next/script";
import { ThemeProvider } from "next-themes";
import { useRef } from "react";

function ThemeScript() {
  const inserted = useRef(false);

  useServerInsertedHTML(() => {
    if (inserted.current) {
      return null;
    }
    inserted.current = true;
    return (
      <Script
        id="theme-init"
        strategy="beforeInteractive"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Constant theme script, not user content.
        dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
      />
    );
  });

  return null;
}

// Inserted into <head> while the document is server-rendered. next-themes also
// renders a <script>, but a missing post is painted on the client, where that
// tag never runs and React reports it. Keep that copy inert.
export const THEME_SCRIPT = `
(function () {
  try {
    var root = document.documentElement;
    var theme = localStorage.getItem('theme') || 'system';

    var resolvedTheme =
      theme === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light')
        : theme;

    root.classList.remove('light', 'dark');

    if (resolvedTheme === 'light' || resolvedTheme === 'dark') {
      root.classList.add(resolvedTheme);
      root.style.colorScheme = resolvedTheme;
    }
  } catch (e) {}
})();
`;

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      enableSystem
      disableTransitionOnChange
      enableColorScheme
      storageKey="theme"
      defaultTheme="system"
      attribute="class"
      scriptProps={{ type: "text/plain" }}
    >
      <ThemeScript />
      {children}
    </ThemeProvider>
  );
}
