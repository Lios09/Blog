import { SITE_INFO } from "@/config/site";
import { getAllPosts } from "@/content";
import { escapeXml, toISODateSafe } from "@/lib/utils";

export async function GET() {
  const itemsXml = getAllPosts()
    .map((doc) => {
      const pubDate = toISODateSafe(doc.metadata.date.toISOString());
      if (!pubDate) return null;
      return `<item>
          <title>${escapeXml(doc.metadata.title)}</title>
          <link>${SITE_INFO.url}/blog/${doc.slug}</link>
          <description>${escapeXml(doc.metadata.description || "")}</description>
          <pubDate>${pubDate}</pubDate>
        </item>`;
    })
    .filter(Boolean)
    .join("\n");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>Blog | ${SITE_INFO.name}</title>
      <link>${SITE_INFO.url}/blog</link>
      <description>${SITE_INFO.description}</description>
      ${itemsXml}
    </channel>
  </rss>`;

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}
