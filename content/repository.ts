import fs from "node:fs";
import path from "node:path";

const DEFAULT_POSTS_DIRECTORY = path.join(process.cwd(), "content/posts");

/** Post filenames are `slug.mdx`; only plain slug segments are allowed. */
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

let postsDirectory = DEFAULT_POSTS_DIRECTORY;

export function setPostsDirectory(directory: string) {
  postsDirectory = directory;
}

export function resetPostsDirectory() {
  postsDirectory = DEFAULT_POSTS_DIRECTORY;
}

export function isSafePostSlug(slug: string): boolean {
  return SAFE_SLUG.test(slug);
}

function resolvePostFilepath(slug: string): string | null {
  if (!isSafePostSlug(slug)) {
    return null;
  }

  const root = path.resolve(postsDirectory);
  const filepath = path.resolve(root, `${slug}.mdx`);
  const relative = path.relative(root, filepath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return null;
  }

  return filepath;
}

export function getPostSource(slug: string) {
  const filepath = resolvePostFilepath(slug);

  if (!filepath || !fs.existsSync(filepath)) {
    return null;
  }

  return fs.readFileSync(filepath, "utf8");
}

export async function getPostUpdatedAt(slug: string) {
  const filepath = resolvePostFilepath(slug);

  if (!filepath) {
    throw new Error(`Invalid post slug: ${slug}`);
  }

  const stats = await fs.promises.stat(filepath);

  return stats.mtime;
}

export function getPostSlugs() {
  return fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""))
    .filter(isSafePostSlug);
}
