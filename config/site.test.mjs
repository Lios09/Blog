import assert from "node:assert/strict";
import test from "node:test";

import { resolveSiteUrl } from "./site.ts";

test("SITE_URL overrides the Vercel hostname", () => {
  assert.equal(
    resolveSiteUrl({
      SITE_URL: "https://blog.example.com/",
      VERCEL_URL: "my-blog-git-main.vercel.app",
      VERCEL_PROJECT_PRODUCTION_URL: "my-blog.vercel.app",
      NODE_ENV: "production",
    }),
    "https://blog.example.com",
  );
});

test("uses the stable Vercel hostname when SITE_URL is unset", () => {
  assert.equal(
    resolveSiteUrl({
      NODE_ENV: "production",
      VERCEL_URL: "my-blog-git-main.vercel.app",
      VERCEL_PROJECT_PRODUCTION_URL: "my-blog.vercel.app",
    }),
    "https://my-blog.vercel.app",
  );
});

test("uses the current Vercel deployment when the production hostname is unset", () => {
  assert.equal(
    resolveSiteUrl({
      NODE_ENV: "production",
      VERCEL_URL: "my-blog-abc123.vercel.app",
    }),
    "https://my-blog-abc123.vercel.app",
  );
});

test("a blank SITE_URL falls through to the Vercel hostname", () => {
  assert.equal(
    resolveSiteUrl({
      SITE_URL: "   ",
      NODE_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: "my-blog.vercel.app",
    }),
    "https://my-blog.vercel.app",
  );
});

test("production builds outside Vercel fail without a public URL", () => {
  assert.throws(() => resolveSiteUrl({ NODE_ENV: "production" }), /SITE_URL/);
});

test("GitHub Actions can compile without a public URL", () => {
  assert.equal(
    resolveSiteUrl({
      NODE_ENV: "production",
      GITHUB_ACTIONS: "true",
    }),
    "http://localhost:3000",
  );
});

test("development uses localhost when no host is configured", () => {
  assert.equal(
    resolveSiteUrl({ NODE_ENV: "development" }),
    "http://localhost:3000",
  );
});

test("SITE_URL must be an absolute http(s) URL", () => {
  assert.throws(
    () =>
      resolveSiteUrl({
        SITE_URL: "blog.example.com",
        NODE_ENV: "production",
      }),
    /http/,
  );
});
