import assert from "node:assert/strict";
import test from "node:test";

import { siteUrl } from "./site.ts";

test("siteUrl prefers SITE_URL and strips a trailing slash", () => {
  assert.equal(
    siteUrl({ SITE_URL: "https://example.com/" }),
    "https://example.com",
  );
});

test("siteUrl uses the Vercel production host when set", () => {
  assert.equal(
    siteUrl({
      VERCEL_PROJECT_PRODUCTION_URL: "my-app.vercel.app/",
      VERCEL_URL: "preview.vercel.app",
    }),
    "https://my-app.vercel.app",
  );
});

test("siteUrl falls back to VERCEL_URL", () => {
  assert.equal(
    siteUrl({ VERCEL_URL: "preview.vercel.app" }),
    "https://preview.vercel.app",
  );
});

test("siteUrl defaults to the self-hosted blog origin", () => {
  assert.equal(siteUrl({}), "https://blog.mizenix.com");
});
