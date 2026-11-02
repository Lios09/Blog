import type { PostFrontmatter } from "./schema";

export interface TOCItemType {
  title: string;
  url: string;
  depth: number;
}

export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface ReadingTime {
  text: string;
  minutes: number;
  words: number;
}

export interface ParsedPost {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
}

export interface Post {
  slug: string;
  metadata: PostFrontmatter;
  content: string;
  headings: Heading[];
  toc: TOCItemType[];
  readingTime: ReadingTime;
  url: string;
}
