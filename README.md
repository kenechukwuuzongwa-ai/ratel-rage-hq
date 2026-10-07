# Ratel Rage HQ

Prelaunch website for the Ratel Rage game. The site is a separate project from the game source in `../RAGE OF RATELS`; no game originals were changed.

## What the game audit found

- The current game is a working HTML5 Canvas browser prototype. The developed combat mission is Level 01, **The Street Tax**, in a Lagos Island/Balogun Street setting. Darki faces Agbero enforcers and MC Olodo.
- The game has lane movement, jabs/chains, uppercut, kick, grab, block, rush, and an Olodo boss encounter. Desktop controls are documented on `/game` from the current runtime.
- Level 02 has a dossier/navigation route, but currently reuses Level 01 fight and intro content. It is described as in development throughout this site.
- A 176.4 MiB Android debug APK exists in the game project. It needs phone validation and release signing; the site does not distribute it as a public release.
- No verified official social URLs or formal versioned public release links were found.
- The official logo, character sprites, front-end story art, and game level plates supplied the visual system. `/media/gameplay.webp` is a real browser capture. Source mapping is in `docs/ASSET_SOURCES.md`.

## Architecture

- **App:** Vinext/Next-compatible App Router, React, TypeScript, CSS/Tailwind tokens. Individual routes under `app/` and reusable UI in `components/`.
- **Data:** Cloudflare D1 for playtesters, Insider subscribers, feedback, bug reports, ideas/votes, and aggregate site events. Schema and migration are in `db/schema.ts` and `drizzle/`.
- **Media:** Cloudflare R2 for optional private screenshots/videos attached to reports. The public art in `public/media/` consists of small optimized WebP exports and the official SVG logo. The original game assets are not published with this site.
- **Rate limiting:** `/api/submit`, `/api/ideas/vote`, and `/api/event` are capped per connection by `lib/rate-limit.ts` (10 submissions per 10 minutes and 30 per day; 30 votes per 10 minutes and 120 per day; 150 events per 10 minutes). Counters live in the `rate_limits` D1 table keyed by a salted digest of the caller that rotates every window, so no IP address is stored or recoverable. Set `RATE_LIMIT_SALT` in production. The limiter fails open if the table is unreachable, and skips entirely when no `CF-Connecting-IP`/`X-Forwarded-For` header is present, so a misconfigured proxy cannot lock every visitor into one shared bucket.
- **Admin:** `/admin` uses ChatGPT sign-in from the Sites runtime plus a server-side `ADMIN_EMAIL` allowlist. It displays site metrics and recent submissions, and can change bug/idea status. With no allowlist configured it exposes no data.
- **Game preview:** `scripts/serve-game-local.mjs` serves the adjacent original browser game on localhost only. `GAME_PREVIEW_URL` controls whether the site shows a launch link. The game source/assets are not copied into the website.
- **Analytics:** Page views and local play clicks are stored without IP addresses or full referrer URLs. Events are purged after 90 days during normal site activity. Test registrations and reports are counted from their own tables.

## Local setup

Node 22.13+ is required. The project is configured for the portable Sites runtime.

1. Install dependencies from the lockfile with `npm ci` (or `node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" ci` if the Windows npm shim is broken).
2. Copy `.env.example` to `.env.local`. Set `ADMIN_EMAIL` to the intended admin account. For the local mock sign-in used by the Sites preview, `seedy@sites.test` is the preview identity. Set `SITE_URL=http://localhost:5173` and `GAME_PREVIEW_URL=http://localhost:5174/` for the local game link.
3. Run `npm run build` once, then apply each pending local D1 migration, in order:

   ```powershell
   node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_overjoyed_lucky_pierre.sql
   node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_workable_jubilee.sql
   ```

4. Start the website with `npm run dev` and open `http://localhost:5173`.
5. In another terminal, run `npm run dev:game` to make the original browser prototype available through the site's Play page. This works only while the adjacent game project remains at `../RAGE OF RATELS`.

`node scripts/run-framework.mjs dev` and `node scripts/serve-game-local.mjs` are equivalent if the npm command shim is unavailable. The local D1 and R2 state lives under ignored `.wrangler/`.

## Implemented flows

- Homepage, game guide, characters, world/story, controls, roadmap/patch notes, Play/download-status center, playtest registration, feedback, bug report with optional media, Insider signup, community page, feature ideas and votes, creator kit, privacy/terms, admin dashboard, responsive navigation, social card, sitemap, robots, favicon.
- Forms have server-side validation, a honeypot, same-origin request checks, private upload limits, per-connection rate limits, and clear success/error states.
- The site stays out of search indexing until public launch (`robots.txt` and metadata). `SITE_URL` should be set to the final trusted domain and indexing enabled at launch.

## What needs external setup before public launch

- A stable HTTPS domain and hosted build URL or packaged browser distribution. The localhost prototype link is for local development only.
- Android phone validation, a release-signed build, and a real distribution URL before enabling Android download.
- Email provider and verified sending domain for automatic playtest invitations/Insider updates. The current forms save signups but send no email.
- Hosted D1/R2 resources, production `ADMIN_EMAIL`, and an access policy for the studio admin account. Configure runtime values through the hosting control plane.
- A public privacy contact channel, finalized privacy/terms wording and retention schedule, and a moderation policy for ideas. Rate limiting ships in code; decide whether a challenge (Turnstile) is also wanted before opening the forms publicly.
- Official social URLs when the accounts actually exist. The site intentionally lists none now.
- Content editing for roadmap/releases/characters is code-backed in V1; it can be moved into the authenticated admin workflow once release cadence warrants it.

## Launch checks

- [ ] Confirm game content and character claims against the shipping build.
- [ ] Replace the local play link with a public tested build and measure successful delivery.
- [ ] Validate and sign the Android build before exposing it.
- [ ] Configure email, admin allowlist, D1/R2, contact channel, and a production `RATE_LIMIT_SALT`.
- [ ] Review privacy/terms, test uploads and data deletion, and moderate public ideas.
- [ ] Set final `SITE_URL`, canonical/social metadata, enable search indexing, and verify all routes on mobile and desktop.

The website is intentionally a prelaunch build. It has not been published publicly.
