import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  author: z.string().default("Your Name"),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
  cover: z.string().optional(),
});

export type PostFrontmatter = z.infer<typeof postSchema>;
