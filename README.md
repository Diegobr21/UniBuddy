# UniBuddy (MBA Buddy)

A university-agnostic assistant where verified students and alumni share their experience, and any student gets answers in their own language. This repository is the **clickable prototype**: real screens, sample data, no database yet.

## Run it

Requires Node 22+.

```bash
npm install          # once, at the root: installs every app and package
npm run dev          # student app      → http://localhost:4321
npm run dev:uni      # demo university  → http://localhost:4322   (second terminal)
```

Everything works without keys. To turn on the AI parts, copy `.env.example` to `apps/web/.env`:

| Key | What it turns on | Without it |
| --- | --- | --- |
| `OPENAI_API_KEY` | The chat answers with gpt-6-luna, only from the stories the person may see | Answers straight from the stories |
| `JEV_API_KEY` | Jev checks every new story (offensive, personal data, usefulness, topic, visibility) in one call | Simple rules |

## Try the demo

Use the dark **Demo** bar at the top of every screen to switch roles and see how access changes:

| Role | What to try |
| --- | --- |
| Visitor | Ask "How do people find a flat?": only public stories, plus a "sign in to see more" card |
| Student | Same question: university-only stories appear, plus "talk to a person". Then share a story in **Contribute** |
| Moderator | **Moderate**: your new story is in the queue with the AI check. Approve it, then open **Releases** |
| Admin | **Releases**: publish the next version; the approved story becomes available in the chat. Roll back if needed |

### Demo University (MCP)

With both apps running, sign in to **Demo University** on the first screen and ask the chat, in English or Spanish:

- "Request my transcript in Spanish" / "Necesito mi certificado de matrícula": the chat prepares a pre-filled form; nothing is sent until you press **Confirm and send**.
- "Book office hours with Prof. Klein tomorrow": same, with the professor and date filled in.
- "What are the upcoming deadlines?": read-only, answered straight away.

Open http://localhost:4322 next to it: every request made from the chat appears in the portal's **Activity** list, marked "MBA Buddy chat (MCP)". The portal's own forms and browser agents (WebMCP) use the same procedures.

How it works: Demo University publishes an MCP server at `/mcp` (`apps/demo-uni/src/pages/mcp.ts`). MBA Buddy's server is the MCP client (`apps/web/src/lib/uni-connectors.ts`); it picks the procedure with gpt-6-luna when `OPENAI_API_KEY` is set, or with simple keyword rules otherwise (`apps/web/src/lib/uni-actions.ts`). The browser never talks to the university directly.

Prototype data lives in server memory: restarting `npm run dev` or `npm run dev:uni` resets it.

## Structure

```
apps/
  web/         Student app (Astro + React). Screens in src/pages, server logic in src/lib and src/pages/api
  demo-uni/    "Demo University" portal: the same procedures for people (forms), browser agents (WebMCP) and MBA Buddy (MCP server at /mcp)
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
| Jev triage in `apps/web/src/lib/triage.ts` (rules if no key) | Same, plus Jev in the chat to route questions to the right person |
| Releases swapped in memory | Scheduled release builder with test questions |
| Demo University MCP server without authentication | Each university's MCP server, called with the student's own token (OAuth) |

## Next steps

- [ ] **Before showing the demo:** add a paid TypeSafe key as `JEV_API_KEY` in `apps/web/.env` so Jev checks new stories (until then, the simple rules run).

1. Replace the sample stories with the answers from the current contribution form.
2. Deploy both apps to share a link: `apps/web` to Netlify (adapter configured), `apps/demo-uni` to any Node host (it runs a server for its MCP endpoint), then set `DEMO_UNI_MCP_URL`.
3. Database, real sign-in and the release builder (phase B of the plan).
