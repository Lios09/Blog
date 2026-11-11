export type MermaidThemeName = "neutral" | "dark";

export type MermaidInitConfig = {
  startOnLoad: false;
  securityLevel: "strict";
  suppressErrorRendering: true;
  theme: MermaidThemeName;
  fontFamily: string;
};

const MERMAID_FONT_FAMILY = "var(--font-geist-mono), ui-monospace, monospace";

export function mermaidTheme(
  resolvedTheme: string | undefined,
): MermaidThemeName | null {
  if (!resolvedTheme) return null;
  return resolvedTheme === "dark" ? "dark" : "neutral";
}

export function mermaidInitConfig(theme: MermaidThemeName): MermaidInitConfig {
  return {
    startOnLoad: false,
    securityLevel: "strict",
    suppressErrorRendering: true,
    theme,
    fontFamily: MERMAID_FONT_FAMILY,
  };
}

export type MermaidSession = {
  theme: MermaidThemeName | null;
};

export const mermaidSession: MermaidSession = { theme: null };

type MermaidRuntime = {
  initialize: (config: MermaidInitConfig) => void;
  render: (
    id: string,
    chart: string,
    host: Element,
  ) => Promise<{ svg: string }>;
};

let runtimePromise: Promise<MermaidRuntime> | null = null;

export function loadMermaidRuntime(): Promise<MermaidRuntime> {
  runtimePromise ??= import("mermaid").then((mod) => ({
    initialize: (config) => {
      mod.default.initialize(config);
    },
    render: (id, chart, host) => mod.default.render(id, chart, host),
  }));
  return runtimePromise;
}

export async function renderMermaidChart({
  session,
  load = loadMermaidRuntime,
  theme,
  id,
  chart,
  host,
}: {
  session: MermaidSession;
  load?: () => Promise<MermaidRuntime>;
  theme: MermaidThemeName;
  id: string;
  chart: string;
  host: Element;
}): Promise<string> {
  const runtime = await load();
  if (session.theme !== theme) {
    runtime.initialize(mermaidInitConfig(theme));
    session.theme = theme;
  }
  const { svg } = await runtime.render(id, chart, host);
  return svg;
}
