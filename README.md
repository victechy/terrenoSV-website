# terrenoSV website

Marketing + live listings site for terrenoSV (land & property in El Salvador),
built as a companion to the terrenoSV app and the *Moving to El Salvador* book.

## Stack

- **Next.js (App Router) + TypeScript + Tailwind CSS v4**
- **Static export** (`output: "export"` in `next.config.ts`), which builds to
  plain HTML/CSS/JS in `/out`. Hosted free on **Cloudflare Pages** (not
  IONOS — the domain is registered at IONOS, but DNS is delegated to
  Cloudflare's nameservers and Cloudflare Pages serves the actual site). No
  server required. To later upgrade to full server rendering (real-time SSR,
  ISR, API routes), remove `output: "export"` and deploy to a Next.js-native
  host instead: same codebase, no rewrite.
- **Data**: listings are read live from the same public Google Sheet the app
  reads (`src/lib/listings.ts`), fetched both at build time (for SEO, so every
  listing gets its own pre-rendered page) and again client-side on page load
  (for freshness between rebuilds).
- **Favorites**: per-device, stored in `localStorage` (mirrors the app's
  AsyncStorage-backed favorites). Liking/unliking also posts to the same
  Google Apps Script endpoint the app uses (`src/lib/likes.ts`), so a like
  from the web and the app land in the same `Likes` column.
- **i18n**: English at the root (`/`, `/listings`, ...), Spanish mirrored
  under `/es` (`/es`, `/es/listings`, ...). There's no middleware since static
  export can't run one, so locale switching is just linking to the other
  prefix. See `src/lib/dictionary.ts`.

## Development

```
npm run dev      # http://localhost:3000
npm run build     # builds static site to /out
npm run lint
```

## Deploying (Cloudflare Pages)

```
npm run build
npx wrangler pages deploy out --project-name=terrenosv --branch=main
```

`--branch=main` is required: the Pages project's production branch is `main`,
but this repo's git branch is `master`. Without the override, wrangler infers
the branch from git, deploys to a `master` branch instead, and the custom
domain (which only serves the production branch) 404s even though the
deploy itself "succeeds" and gets its own `*.pages.dev` preview URL.

If a `wrangler pages` command ever prints "Delegating to the latest version
of Cloudflare Pages, now part of Cloudflare Workers" and starts rewriting
`next.config.ts` / `package.json` / creating `wrangler.jsonc`: that's
wrangler auto-detecting Next.js and trying to migrate this to a full
OpenNext/Workers SSR deployment, the wrong architecture for this project
(and broken on Windows). Revert those files
(`git checkout -- next.config.ts package.json .gitignore package-lock.json`,
delete any new `open-next.config.ts` / `wrangler.jsonc` / `public/_headers`),
then re-run the same command with `--force` appended to skip the migration.

Because listings are baked in at build time, **redeploy periodically** to
pick up newly approved listings in the pre-rendered pages and the homepage's
featured snapshot. The client-side refresh in `ListingsBrowser` keeps
`/listings` itself live between deploys regardless.

## Project structure

```
src/app/(en)/...     English routes (unprefixed)
src/app/es/...        Spanish routes (mirrors (en) 1:1)
src/components/        Shared UI (Header, Footer, ListingCard, Calculator, ...)
src/components/views/  Full-page views shared by both locale route trees
src/lib/                Data layer: CSV parsing, listings mapping, area
                        conversion, i18n dictionary, favorites/likes
```
