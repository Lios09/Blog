import fs from "node:fs";
import path from "node:path";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

export function getPostSource(slug: string) {
  const filepath = path.join(POSTS_DIR, `${slug}.mdx`);

  if (!fs.existsSync(filepath)) {
    return null;
  }

  return fs.readFileSync(filepath, "utf8");
}

export async function getPostUpdatedAt(slug: string) {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);

  const stats = await fs.promises.stat(filePath);

  return stats.mtime;
}

export function getPostSlugs() {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}
