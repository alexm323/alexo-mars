# Personal Site

A personal hub site — bio, links, and two small projects — built with
React, TypeScript, Vite, Tailwind CSS, and React Router.

## Running it locally

```bash
npm install     # one-time setup
npm run dev     # starts a local server, printed in the terminal (usually http://localhost:5173)
```

Edit files under `src/` and the page hot-reloads as you save.

```bash
npm run build     # outputs a static production build to dist/
npm run preview   # preview that build locally
```

## Editing content

Your name, tagline, bio, links, and email live in one file:
**[`src/content/site.ts`](src/content/site.ts)**. Open it and replace the
placeholder strings — nothing else needs to change.

## Pages

- **`/`** — the personal hub: avatar, name, tagline, links, bio, and a
  grid of project cards.
- **`/paint-names`** — [`src/pages/PaintNameGenerator.tsx`](src/pages/PaintNameGenerator.tsx).
  Pick any color and get a whimsical, paint-swatch-style name for it. Fully
  client-side — the naming logic lives in
  [`src/lib/paintNames.ts`](src/lib/paintNames.ts) (hue/saturation/lightness
  buckets + word banks, no API or dictionary file needed).
- **`/date-survey`** — [`src/pages/DateSurvey.tsx`](src/pages/DateSurvey.tsx).
  A short feedback form (rating, "down for another date?", a couple of free
  text questions) meant to be sent to someone after a date.

## About the Date Survey — no backend yet

Right now the survey has no server to send responses to, so after
answering, the person filling it out gets two options: **"Send as
email"** (opens their email client with the answers pre-filled, addressed
to `site.email`) or **"Copy answers"** (copies the summary text to their
clipboard). Either way, *they* have to actually hit send/paste it
somewhere — nothing arrives automatically.

If you want responses to land somewhere automatically (so you don't rely
on the other person following through), the next step is wiring the form
up to a real backend. Reasonable options, roughly easiest to hardest:

- **A form backend service** (e.g. Formspree, Getform) — add an account,
  point the form's submit handler at their endpoint. No server code of
  your own.
- **A Google Form embed/redirect** — free, gives you a spreadsheet of
  responses, less custom-looking.
- **A tiny API route + database** (e.g. a serverless function + a hosted
  Postgres/SQLite) — most control, most setup.

Say the word if you want me to wire up one of these.

## Project structure

```
src/
  content/site.ts       your name, tagline, bio, links, email, project list
  components/Layout.tsx header/nav + footer shell used on every page
  pages/
    Home.tsx             the personal hub
    PaintNameGenerator.tsx
    DateSurvey.tsx
  lib/paintNames.ts       color -> paint name generation logic
  App.tsx                 route definitions
public/                   favicon, static assets served as-is
```

## Deploying

This is a static Vite app, so it deploys anywhere that serves static
files — Vercel, Netlify, GitHub Pages, Cloudflare Pages, etc. Run
`npm run build` and deploy the `dist/` folder, or connect the repo to a
host that runs the build for you (e.g. Vercel auto-detects Vite).
