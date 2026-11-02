type SiteEnv = Record<string, string | undefined>;

const LOCAL_SITE_URL = "http://localhost:3000";

export function resolveSiteUrl(env: SiteEnv = process.env): string {
  const configured = env.SITE_URL?.trim();

  if (configured) {
    return normalizeSiteUrl(configured);
  }

  const vercelHost =
    env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || env.VERCEL_URL?.trim();

  if (vercelHost) {
    return normalizeSiteUrl(`https://${vercelHost}`);
  }

  // GitHub Actions only compiles the app. Vercel injects the public host.
  if (env.NODE_ENV === "production" && env.GITHUB_ACTIONS !== "true") {
    throw new Error(
      "SITE_URL is required for production builds outside Vercel. Set it to the public site origin, for example https://blog.example.com. Vercel builds use the project's vercel.app hostname automatically.",
    );
  }

  return LOCAL_SITE_URL;
}

function normalizeSiteUrl(value: string): string {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(
      `SITE_URL must be an absolute http(s) URL. Received "${value}".`,
    );
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(
      `SITE_URL must be an absolute http(s) URL. Received "${value}".`,
    );
  }

  url.search = "";
  url.hash = "";

  return url.href.replace(/\/$/, "");
}

export const SITE_INFO = {
  name: "zenix Leo",
  url: resolveSiteUrl(),
  ogImage: "/og-image.jpg",
  description:
    "A blog about my thoughts, notes, and things I learn along the way.",
  keywords: "blog, thoughts, notes, learning",
};
