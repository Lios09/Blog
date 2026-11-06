import fs from "node:fs";
import path from "node:path";

/**
 * Must stay a static `path.join(process.cwd(), …)` so Turbopack can scope
 * file tracing to `content/posts` instead of the whole project.
 */
const DEFAULT_POSTS_DIRECTORY = path.join(process.cwd(), "content", "posts");

/** Post filenames are `slug.mdx`; only plain slug segments are allowed. */
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

/** Test-only override; never set in production. */
let postsDirectoryOverride: string | null = null;

export function setPostsDirectory(directory: string) {
  postsDirectoryOverride = directory;
}

export function resetPostsDirectory() {
  postsDirectoryOverride = null;
}

export function isSafePostSlug(slug: string): boolean {
  return SAFE_SLUG.test(slug);
}

function resolvePostFilepath(slug: string): string | null {
  if (!isSafePostSlug(slug)) {
    return null;
  }

  const root = postsDirectoryOverride
    ? path.resolve(/* turbopackIgnore: true */ postsDirectoryOverride)
    : DEFAULT_POSTS_DIRECTORY;
  const filepath = path.join(root, `${slug}.mdx`);
  const relative = path.relative(root, filepath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return null;
  }

  return filepath;
}

export function getPostSource(slug: string) {
  const filepath = resolvePostFilepath(slug);

  if (!filepath) {
    return null;
  }

  if (postsDirectoryOverride) {
    if (!fs.existsSync(/* turbopackIgnore: true */ filepath)) {
      return null;
    }

    return fs.readFileSync(/* turbopackIgnore: true */ filepath, "utf8");
  }

  if (!fs.existsSync(filepath)) {
    return null;
  }

  return fs.readFileSync(filepath, "utf8");
}

export function getPostSlugs() {
  if (postsDirectoryOverride) {
    return fs
      .readdirSync(/* turbopackIgnore: true */ postsDirectoryOverride)
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => file.replace(/\.mdx$/, ""))
      .filter(isSafePostSlug);
  }

  return fs
    .readdirSync(DEFAULT_POSTS_DIRECTORY)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""))
    .filter(isSafePostSlug);
}
