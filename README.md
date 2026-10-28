# zx's Blog

Thoughts, notes, and things worth keeping.

A personal blog built with the Next.js App Router, with posts stored as local MDX files. The homepage welcomes readers with a handwritten greeting and an animated background, while article pages offer table-of-contents navigation, syntax highlighting, and related posts.

## Features

- **Animated homepage**: A handwritten greeting, background effects, and an entry point to the blog.
- **Post archive**: Published articles listed in reverse chronological order.
- **MDX authoring**: GitHub Flavored Markdown with custom React components.
- **Reading tools**: Automatically extracted headings, estimated reading time, and related posts.
- **Technical content**: Shiki syntax highlighting, Twoslash type hints, callouts, and components for Mermaid diagrams and KaTeX formulas.
- **Article metadata**: Page titles, descriptions, and Open Graph article metadata generated from each post's frontmatter.

## Tech Stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 16.3.4 · React 19.2 · TypeScript |
| Styling and interaction | Tailwind CSS 4 · shadcn/ui · Base UI · Motion |
| Content processing | MDX · gray-matter · Zod · remark / rehype |
| Code and diagrams | Shiki · Twoslash · Mermaid · KaTeX |
| Development tools | pnpm · Biome |
| Deployment configuration | Docker · Docker Compose · Caddy |

## Local Development

Use Node.js `26.12.1` (recorded in `.node-version`) to match CI. Docker CI reads this same file; local Docker builds default to the latest LTS unless `NODE_VERSION` is supplied. The project specifies `pnpm@12.15.0` as its package manager.

From the project root, run:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the homepage or [http://localhost:3000/blog](http://localhost:3000/blog) for the post archive.

Posts are read directly from local files, so no database setup is required.

### Commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Start the production server after building |
| `pnpm lint` | Check code with Biome |
| `pnpm typecheck` | Generate Next.js route types and check TypeScript without emitting files |
| `pnpm test` | Run the existing Node.js tests for syntax highlighting and popover positioning |
| `pnpm format` | Format files in place with Biome |

## Writing Posts

Create an `.mdx` file in `content/posts/`. The filename becomes the post's slug: `hello-world.mdx`, for example, is available at `/blog/hello-world`.

```mdx
---
title: "Hello, World"
description: "A few words about this blog and why I started writing."
date: "2026-09-21"
author: "zx"
tags:
  - Notes
published: true
---

## Start Here

Write things down. Give your thoughts a place to grow.

> [!NOTE]
> Add a useful aside or a little extra context here.
```

### Frontmatter

Post frontmatter is validated with Zod. See [`content/schema.ts`](content/schema.ts) for the schema.

| Field | Required | Description |
| --- | --- | --- |
| `title` | Yes | A nonempty post title |
| `description` | Yes | A nonempty post summary |
| `date` | Yes | Publication date; `YYYY-MM-DD` is recommended |
| `updated` | No | Last updated date |
| `author` | No | Author name; defaults to `Your Name`, so setting it explicitly is recommended |
| `tags` | No | An array of tags; defaults to an empty array |
| `category` | No | Post category |
| `published` | No | Whether to include the post in the archive; defaults to `true` |
| `featured` | No | Featured flag; defaults to `false` |
| `cover` | No | Cover image path |

Setting `published: false` excludes a post from the archive and the list of routes generated ahead of time. The article page still reads files by slug, so this field does not control access to a post.

Place static images in `public/` and reference them with paths starting with `/`. Custom MDX components are registered in [`mdx-components.tsx`](mdx-components.tsx).

## Deployment

### Node.js Server

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

The server listens on port `3000` by default.

### Docker and Caddy

The repository includes a multi-stage `Dockerfile`, a `compose.yml` file, and a Caddy reverse proxy configuration. Before using them:

Standalone output is enabled in `next.config.ts` for the Docker image.

1. Replace `blog.example.com` in `Caddyfile` with your domain and point its DNS records to your server.
2. Make ports `80` and `443` available to Caddy on the server.

Then run:

```bash
docker compose up -d --build
```

Caddy forwards requests to `blog:3000` and manages HTTPS for the configured domain. The blog service's `ports: ["3000"]` setting assigns a host port rather than binding to host port `3000`. Access the site through your configured domain when using this setup.

## Customization

- **Site title and description**: Update `metadata` in `app/layout.tsx`.
- **Homepage copy and links**: Edit `app/page.tsx`.
- **Post archive copy**: Edit `app/blog/page.tsx`.
- **Colors and global styles**: Edit `app/globals.css`.
- **Posts and static assets**: Add files to `content/posts/` and `public/`, respectively.

## Continuous Integration

`.github/workflows/ci.yml` runs on pull requests, pushes to `main`, and manual dispatch. Lint, type checking, existing Node.js tests, and the production build run in parallel with frozen pnpm installs. After all checks pass on `main` (push or manual dispatch), CI builds and pushes the Docker image to GHCR by default, tagged with the commit SHA and `latest`. Pull requests run code checks without publishing images. GHCR authentication uses the built-in `GITHUB_TOKEN`.

pnpm dependencies, Next.js build artifacts, and Docker layers are cached. Superseded runs are cancelled, jobs have timeouts, and the workflow token has read-only repository access. Only the publishing job receives `packages: write` to publish to GHCR.

Dependabot checks GitHub Actions, npm dependencies, and the Docker base image weekly. Update `.node-version` to change Node.js for all CI jobs, including Docker; pnpm is read from `package.json`. Action versions are pinned to the latest stable releases verified on 2026-10-28.

### CI variables

Set optional repository variables under **Settings → Secrets and variables → Actions → Variables**:

| Variable | Default | Purpose |
| --- | --- | --- |
| `CI_DOCKER_REGISTRY` | `ghcr.io` | Target registry hostname |
| `CI_DOCKER_IMAGE` | Current `owner/repository` | Image path within the registry, normalized to lowercase |
| `CI_DOCKER_USERNAME` | Workflow actor | Registry login username |
| `CI_DOCKER_CACHE_SCOPE` | Current `owner/repository` | Docker layer cache scope |
| `NODE_IMAGE_VARIANT` | `bookworm-slim` | Official Node.js image variant |

For Docker Hub or another registry, configure these variables and add the registry access token as the Actions secret `CI_DOCKER_PASSWORD`. For example, use `docker.io` as the registry and `username/blog-app` as the image path. GHCR uses the built-in token when this secret is unset. Existing GHCR packages must grant this repository Actions access to allow publishing.

Docker CI builds and pushes the image; it does not start containers. GitHub Actions requires literal `uses:` references, so Action versions remain explicit.

For a local Compose build using the CI Node.js version:

```bash
NODE_VERSION="$(cat .node-version)" docker compose build blog
```

For a direct Docker build:

```bash
docker build --build-arg NODE_VERSION="$(cat .node-version)" --tag blog-app:local .
```
