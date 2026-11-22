# UniBuddy (MBA Buddy)

A university-agnostic assistant where verified students and alumni share their experience, and any student gets answers in their own language. This repository is the **clickable prototype**: real screens, sample data, no database yet.

## Run it

Requires Node 22+.

```bash
npm install          # once, at the root: installs every app and package
npm run dev          # student app      → http://localhost:4321
npm run dev:uni      # demo university  → http://localhost:4322
```

The chat works without any key: it answers straight from the sample stories. To answer with the AI model, copy `.env.example` to `apps/web/.env` and add `OPENAI_API_KEY`.

## Try the demo

Use the dark **Demo** bar at the top of every screen to switch roles and see how access changes:

| Role | What to try |
| --- | --- |
| Visitor | Ask "How do people find a flat?": only public stories, plus a "sign in to see more" card |
| Student | Same question: university-only stories appear, plus "talk to a person". Then share a story in **Contribute** |
| Moderator | **Moderate**: your new story is in the queue with the AI check. Approve it, then open **Releases** |
| Admin | **Releases**: publish the next version; the approved story becomes available in the chat. Roll back if needed |

Prototype data lives in server memory: restarting `npm run dev` resets it.

## Structure

```
apps/
  web/         Student app (Astro + React). Screens in src/pages, server logic in src/lib and src/pages/api
  demo-uni/    "Demo University" portal: procedures exposed to AI agents with WebMCP
packages/
  ui/          Design tokens (colours, type) and shared building blocks, taken from the Claude Design screens
  data/        Types, sample universities and stories, and the access rules (src/access.ts)
```

The most important file is `packages/data/src/access.ts`: it decides what each person may see **before** anything reaches the AI model. The real version keeps that rule and moves the data to a database.

## What is placeholder (and what replaces it)

| Prototype | Real platform |
| --- | --- |
| Role picked in the Demo panel (cookie) | University sign-in (SSO: SAML / OIDC, eduGAIN), or institutional email |
| Sample stories in `packages/data` | EU-hosted Postgres with row-level security |
| Keyword search over stories | Versioned search index (embeddings) per release |
| `mockTriage` rules in `apps/web/src/lib/triage.ts` | Jev (TypeSafe) classifier |
| Releases swapped in memory | Scheduled release builder with test questions |
| Demo University WebMCP only | Plus an MCP server MBA Buddy's chat can call (MCP UI forms in the chat) |

## Next steps

1. Replace the sample stories with the answers from the current contribution form.
2. Deploy `apps/web` to Netlify (adapter already configured) to share a link.
3. MCP server for Demo University, connected to the chat.
4. Database, real sign-in and the release builder (phase B of the plan).
