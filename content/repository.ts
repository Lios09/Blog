import fs from "node:fs";
import path from "node:path";

const DEFAULT_POSTS_DIRECTORY = path.join(process.cwd(), "content/posts");

let postsDirectory = DEFAULT_POSTS_DIRECTORY;

export function setPostsDirectory(directory: string) {
  postsDirectory = directory;
}

export function resetPostsDirectory() {
  postsDirectory = DEFAULT_POSTS_DIRECTORY;
}

export function getPostSource(slug: string) {
  const filepath = path.join(postsDirectory, `${slug}.mdx`);

  if (!fs.existsSync(filepath)) {
    return null;
  }

  return fs.readFileSync(filepath, "utf8");
}

export async function getPostUpdatedAt(slug: string) {
  const filePath = path.join(postsDirectory, `${slug}.mdx`);

  const stats = await fs.promises.stat(filePath);

  return stats.mtime;
}

export function getPostSlugs() {
  return fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}
