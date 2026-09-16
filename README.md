# terrenoSV website

Marketing + live listings site for terrenoSV (land & property in El Salvador),
built as a companion to the terrenoSV app and the *Moving to El Salvador* book.

## Stack

- **Next.js (App Router) + TypeScript + Tailwind CSS v4**
- **Static export** (`output: "export"` in `next.config.ts`) — builds to plain
  HTML/CSS/JS in `/out`, deployable directly to IONOS shared hosting via FTP.
  No server required. To later upgrade to full server rendering (real-time
  SSR, ISR, API routes), remove `output: "export"` and deploy to
  Vercel/Netlify instead — same codebase, no rewrite.
- **Data**: listings are read live from the same public Google Sheet the app
  reads (`src/lib/listings.ts`), fetched both at build time (for SEO — every
  listing gets its own pre-rendered page) and again client-side on page load
  (for freshness between rebuilds).
- **Favorites**: per-device, stored in `localStorage` (mirrors the app's
  AsyncStorage-backed favorites). Liking/unliking also posts to the same
  Google Apps Script endpoint the app uses (`src/lib/likes.ts`), so a like
  from the web and the app land in the same `Likes` column.
- **i18n**: English at the root (`/`, `/listings`, ...), Spanish mirrored
  under `/es` (`/es`, `/es/listings`, ...). No middleware — static export
  can't run one — so locale switching is just linking to the other prefix.
  See `src/lib/dictionary.ts`.

## Development

```
npm run dev      # http://localhost:3000
npm run build     # builds static site to /out
npm run lint
```

## Deploying to IONOS

1. `npm run build`
2. Upload the contents of `/out` (not the `out` folder itself — its
   contents) to your IONOS hosting root (usually the directory that serves
   terrenosv.org) via FTP/SFTP or IONOS's file manager.
3. Because listings are baked in at build time, **re-run the build and
   re-upload periodically** (or wire up a scheduled CI job) to pick up newly
   approved listings in the pre-rendered pages — the client-side refresh in
   `ListingsBrowser` covers freshness between rebuilds, but individual
   listing detail pages (and their SEO metadata) only regenerate on rebuild.

## Project structure

```
src/app/(en)/...     English routes (unprefixed)
src/app/es/...        Spanish routes (mirrors (en) 1:1)
src/components/        Shared UI (Header, Footer, ListingCard, Calculator, ...)
src/components/views/  Full-page views shared by both locale route trees
src/lib/                Data layer: CSV parsing, listings mapping, area
                        conversion, i18n dictionary, favorites/likes
```
