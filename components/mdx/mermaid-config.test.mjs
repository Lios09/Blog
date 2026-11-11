import assert from "node:assert/strict";
import test from "node:test";

import {
  mermaidInitConfig,
  mermaidTheme,
  renderMermaidChart,
} from "./mermaid-config.ts";

test("waits until the site theme is resolved", () => {
  assert.equal(mermaidTheme(undefined), null);
});

test("uses mermaid's dark theme only when the site is dark", () => {
  assert.equal(mermaidTheme("dark"), "dark");
  assert.equal(mermaidTheme("light"), "neutral");
});

test("initializes once per theme and renders into the host", async () => {
  const calls = [];
  const host = { id: "host" };
  const runtime = {
    initialize(config) {
      calls.push(["initialize", config]);
    },
    async render(id, chart, container) {
      calls.push(["render", id, chart, container]);
      return { svg: "<svg id='ok'></svg>" };
    },
  };
  const session = { theme: null };
  const load = async () => runtime;
  const chart = "flowchart TD\nA-->B";

  const first = await renderMermaidChart({
    session,
    load,
    theme: "neutral",
    id: "mermaid-a",
    chart,
    host,
  });
  const second = await renderMermaidChart({
    session,
    load,
    theme: "neutral",
    id: "mermaid-b",
    chart: "flowchart TD\nA-->C",
    host,
  });
  await renderMermaidChart({
    session,
    load,
    theme: "dark",
    id: "mermaid-a",
    chart,
    host,
  });

  assert.equal(first, "<svg id='ok'></svg>");
  assert.equal(second, "<svg id='ok'></svg>");
  assert.deepEqual(
    calls.filter((call) => call[0] === "initialize").map((call) => call[1]),
    [mermaidInitConfig("neutral"), mermaidInitConfig("dark")],
  );
  assert.equal(calls[1][0], "render");
  assert.equal(calls[1][1], "mermaid-a");
  assert.equal(calls[1][2], chart);
  assert.equal(calls[1][3], host);
  assert.equal(mermaidInitConfig("dark").suppressErrorRendering, true);
  assert.equal(mermaidInitConfig("dark").securityLevel, "strict");
});
