# HANDOFF — "Stash" (placeholder name): personal learning-backlog app
Last updated: 2026-11-26. Status: LOCAL-ONLY storage. Steps 1–4 built and tested here (step 4 = Courses, Certificates, Books, Projects). Live at https://youssefabdelkawy.github.io/stash/. Phone tests of steps 2–4 still pending. Next: step 5 (search, tags, filters).

## 1. The problem
The owner keeps finding courses, YouTube videos, books, certificates to aim for, and project ideas. They send them to themselves on WhatsApp, and they get lost in the endless messages and never get done. The goal: one place that stores all of this, makes it easy to find again, and pushes items toward "done". Build it first as a web app, then turn it into an Android app.

## 2. Working rules (the owner's instructions — follow every time)
See also STANDARDS.md: the fixed stack, no-hallucination rules, security, and the definition of done. Re-read it whenever unsure.

- **Prototype before building.** Before fully building any visual or feature, show a usable demo or clickable prototype, at least 2 options, so the owner can accept or reject one. Build only the chosen one.
- **Finish the whole job before stopping.** Don't offer to continue; continue.
- **Ask before deleting anything** (files, tables, data, branches, projects).
- **Don't write an unfamiliar feature from scratch.** Search GitHub for open-source projects that do it first, compare their approaches, then start.
- **End every piece of work with a recap** for someone who saw none of it: key points first, plain words.
- **Interview style when asking questions:** one question at a time, as clickable multiple choice (the AskUserQuestion tool), recommended option first. Then **keep working in the same turn**: don't end the reply to wait for each answer (owner, 2026-11-18).
- **Everything must be free forever** (no paid tiers, no credit card).

## 3. Decisions made (from the planning interview)
| Area | Decision |
|---|---|
| Phone | Android |
| Saving things | Installed web app (PWA) that appears in Android's Share menu: tap Share in YouTube or Chrome, pick the app, and it saves at once. Uses the Web Share Target API (Chrome on Android only). |
| Tech stack | React + Vite. **All data stays on the phone** (owner's decision 2026-11-18, replaces Supabase): no account, no sign-in, no cloud database. The app files are served from free **GitHub Pages** (owner's pick 2026-11-18, replaces Vercel) at https://youssefabdelkawy.github.io/stash/ so the PWA can be installed. Later wrapped into a real Android app with Capacitor. |
| Cost | $0. (Old note, Supabase no longer used:) Supabase free plan: 500 MB database, 1 GB images, no card. Catch: a free project sleeps after 7 days unused; restore it with one click in the Supabase dashboard (data is kept). Firebase was rejected because image storage now needs a card on file. Re-check these limits on the pricing pages. |
| Who builds | Claude builds, the owner learns by reading and tweaking. Keep the code small and readable. |
| Sections (v1) | Videos, Courses/learning sites, Certificates, Books, Projects (details below). |
| Status | Every item is To do / Doing / Done. The home screen shows Doing items first, plus a "random pick from To do" button. |
| Quick-save | Any item can be saved as a Draft with missing fields and gets a "Needs details" badge to finish later. |
| Finding things | One search box (titles, descriptions, tags), topic tags across all sections, and filters by section and status. |
| Old WhatsApp links | Start fresh. No import. |
| Reminders | None in v1. |
| Visual look | **B · Glow** (picked 2026-11-18 from `prototypes/look.html`, A Studio / B Glow): dark first with a light version, soft colored light behind the header, frosted-glass Now card with a cover tile, Sora headings + Inter text, line icons (`app/src/Icon.tsx`), a colored cover tile and dot per section (video red, course blue, certificate violet, book amber, project teal), underline tabs, items grouped in one rounded panel, backup/restore as icon buttons. The prototype's search box, bottom section bar and + button arrive in steps 2 and 5 in this same style. |
| Motion | **B · Cinematic** (picked 2026-11-18 from `prototypes/motion.html`, A Calm / B Cinematic): words rise on open, Now card lifts in with a light sweep, rows fly into the tab they move to, tab counts pop, tab lists slide (View Transitions), slot-machine Random pick, Done stamp with sparks, Now card shrinks on scroll. All in `app/src/motion.ts` (Web Animations API, no library). Everything is off when the phone asks to reduce motion. |
| Add video | **B · Full page** (picked 2026-11-18 from `prototypes/videos.html`, A Bottom sheet / B Full page): + opens a full-screen Add page with a big "Paste from clipboard" button, a link field below, and a live preview card (thumbnail + title) once the link is valid. One "Save to To do" button. |
| Tap an item | Opens a **detail sheet** (owner's pick 2026-11-18): edit the title, Open in YouTube (or Open link), To do / Doing / Done buttons (the row then flies to its new tab), Archive (sets `archived_at`, never deletes). The Now card opens it too. |
| Same video twice | **"Already saved"** (owner's pick 2026-11-18): the Add page shows which tab it is in plus an "Open it" button, and Save stays off. Matched by YouTube video id, so different link shapes of one video count as the same. Archived videos don't count. |
| App name | **Stash** (owner's pick 2026-11-18). |
| App icon | **B · Stack** (owner's pick 2026-11-18 from `prototypes/icons.html`, artifact https://claude.ai/artifact/KR1Apn8wckg548fkjjMSoX): three tilted section cards (teal, blue, red) with a white play mark on the dark Glow background. Files: `app/public/icon.svg`, `icon-192.png`, `icon-512.png` (PNGs rendered from the SVG with Playwright). |
| Shared non-YouTube links | **Saved at once as a Draft** with "Needs details" (owner's pick 2026-11-18). They land in **Courses**, keeping the page title Chrome sends; move them with the section chips in the detail sheet (step 4). The same link shared twice → "Already saved" and its sheet opens. |
| Adding (step 4) | **A · Pick a section first** (owner's pick 2026-11-26 from `prototypes/sections.html`, artifact https://claude.ai/artifact/94LpAg14RULcrquAFAhovT): + opens "Add to Stash" with five section tiles; Video opens the existing video page, the others open that section's own form. Save says "Save to To do", or "Save as Draft" while required fields are missing (never blocked). After saving a project, its sheet opens to add goal steps. |
| Certificate proof | **B · Proof always in the sheet** (owner's pick 2026-11-26): a Proof box on every certificate's sheet (file: PDF or image, plus credential link), "for when you finish" until Done. No pop-up. |
| Project checklist | **B · Tick mode + Edit mode** (owner's pick 2026-11-26): tick steps; "Edit steps" switches to rename, reorder (↑ ↓), remove and add. A project with no steps opens in Edit mode so several steps can be added in a row (found in testing). |
| Changing section | **A · Section chips on every detail sheet** (owner's pick 2026-11-26): any item can move to any section; typed fields are kept. |
| Required fields | Decided while building (tell the owner; change if wanted): every section needs a name/title; Courses also need a link; Projects need at least one goal step. Everything else is optional. Missing any → Draft with "Needs details". Any edit in the sheet re-checks this. |
| Backup | 'Download backup' button saves one file to the phone (owner can put it in Google Drive); 'Restore' loads it back. No automatic reminder. (Owner's pick 2026-11-18.) Since step 4 (version 2): includes screenshots and proofs, and archived items too. Version 1 backups still restore. |
| Home-screen look | **B · Focus** (picked 2026-11-18 from prototypes A Shelf / B Focus in `prototypes/home.html`): big "Now" card for the current Doing item, search box, Doing / To do / Done tabs with compact rows, a Random pick row in To do, sections in a bottom tab bar, a + button to save. |

### Section details
- **Videos (YouTube):** paste or share a link. Show the thumbnail (free from `img.youtube.com/vi/<id>/hqdefault.jpg`) and the title (from YouTube's free oEmbed endpoint). Tapping it opens the video.
- **Courses / learning sites:** paste the link and type the title (and optional description), plus topic tags for what the site teaches. Can be saved as a Draft. Auto-fill from the page's og: tags is postponed to the Capacitor step, where a native app may be able to read other sites (unverified until then). (Owner's pick 2026-11-18; no server.)
- **Certificates:** name, screenshot (often taken from a YouTube video), provider, sign-up link, free or paid plus price, status, and once earned, proof (certificate PDF or image plus credential URL), so the app also works as an achievements wallet for a CV.
- **Books:** name and optional author, plus status and tags.
- **Projects:** optional written goal description, a required goal checklist (shows "3/7 done"), size (S = weekend, M = 1–2 weeks, L = about a month, XL = several months) and difficulty (Beginner / Mid / Advanced). If busy, save it as a Draft with the checklist empty and finish it later.

### Left out of v1
Reminders and notifications, WhatsApp import, AI summaries, iPhone support, and linking a certificate to a course.

## 4. Build order (each step works on its own)
1. Local storage on the phone + backup/restore + home screen. DONE (2026-11-18).
2. Videos section. DONE (2026-11-18).
3. Share button (installable PWA plus share target). The app becomes usable from here. BUILT (2026-11-18); phone test pending.
4. Courses (typed in; auto-fill waits for Capacitor), Certificates, Books, Projects. DONE (2026-11-26); phone test pending.
5. Search, tags and filters.
6. Deploy (GitHub Pages, pulled forward into step 3) and install on the phone.
7. Later: wrap with Capacitor into an Android app.

Before steps 2–5: show at least 2 prototypes (rule 1). Before the share target, local storage and backup: research GitHub examples first (rule 4).

## 5. Tools to use
Plugins (installed):
- **Vercel:** deploys the app and pushes updates. Same sign-in needed. The Vercel CLI is not installed yet (`npm i -g vercel`).

Skills already available: superpowers:writing-plans, frontend-design, vectorlab-ux-skills:forms, vectorlab-ux-skills:empty-states, superpowers:test-driven-development, anthropic-skills:playwright-skill, superpowers:verification-before-completion, ponytail.

Hook (in `.claude/settings.json`): after each file edit, runs the type check and linter.

Plugins not needed: Figma, MongoDB, extra React plugins.

## 5b. What exists (step 1, local-only version)
- `app/`: React + Vite + TypeScript. No sign-in. Focus home (Now card, Doing / To do / Done tabs, Random pick, tap a row to move it along, "Needs details" badge, empty states) plus **Backup** (downloads `stash-backup-YYYY-MM-DD.json`) and **Restore** (adds/overwrites by id, never removes). Search box, section tab bar and + button come in steps 2 and 5.
- `app/src/store.ts`: items saved in the phone's IndexedDB via **idb-keyval** (npm `idb-keyval` 6.3.0, repo github.com/jakearchibald/idb-keyval). Compared with: localStorage (no images), localForage (last release 2022), Dexie (much bigger, more than needed), idb (more code). Compared via npm registry + package README; the GitHub API was blocked in this session. Also asks Chrome to keep the data (`navigator.storage.persist`).
- `app/src/backup.ts` + test: makes and checks backup files (rejects non-Stash files and damaged items). Images are not in backups yet (comes with step 4).
- `app/src/items.ts` + test: status cycling, Now pick, random pick, needs-details.
- Supabase files and package deleted with the owner's OK (2026-11-18).
- `.claude/settings.json`: hook runs type check + lint after every edit.
- `app/src/Icon.tsx`: line icons and section cover tiles.
- `app/src/motion.ts`: the Cinematic motion helpers. `prototypes/`: home.html (layout A/B), motion.html (motion A/B), look.html (look A/B).
- `app/src/items.ts` also has `checklistProgress` ("3/7 steps done" bar on the Now card) and `displayTitle` (title, else link, else Untitled), both tested.

## 5c. What exists (step 2, Videos)
- `app/src/youtube.ts` + test (26 link shapes): `cleanLink` (trim, http(s) only, max 2,000 chars), `youTubeId` (watch, youtu.be, shorts, embed, live; www/m/music hosts), `thumbnailUrl`, `fetchTitle` (oEmbed, 5 s timeout, null on any failure). oEmbed browser access (CORS) re-checked 2026-11-18.
- `app/src/AddVideo.tsx`: the full-page Add flow. Paste button uses `navigator.clipboard.readText()`; if Chrome refuses, it says to long-press the box and Paste. No title found → saves as a Draft with "Needs details".
- `app/src/Details.tsx`: the detail sheet. The title saves as you type.
- `app/src/Panel.tsx`: native `<dialog>` used for both (focus, Back/Escape and backdrop come from the browser), animated with `panelIn`/`panelOut` in `motion.ts`.
- `Cover` in `Icon.tsx` shows the YouTube thumbnail (16:9 crop), falling back to the red tile offline.
- + button (bottom right) opens Add. New videos land in To do and the To do tab opens.
- `app/e2e/videos.cjs` (`npm run build && npm run e2e`): Playwright at 390 px with YouTube mocked: paste → save with thumbnail, failed title → Draft, bad link, duplicate → Open it, rename, move to Doing, fill a draft's title, archive, reload keeps data. Screenshots in light and dark go to `app/e2e/shots/` (not in git). Uses the Playwright preinstalled in Claude Code cloud containers (`NODE_PATH=$(npm root -g)`), no new dependency.
- Gotcha: `.bar` is the Now card's progress bar class; the Add page header is `.topbar`.

## 5d. What exists (step 3, Share button)
- Research (rule 4), pages actually opened: MDN share_target (https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/share_target): "Your PWA can only act as a web share target if it has been installed"; GET sends title/text/url as query parameters. Chrome docs (https://developer.chrome.com/docs/capabilities/web-apis/web-share-target): Android Chrome 76+, and on Android "the `url` field will be empty… URLs will often appear in the `text` field, or occasionally in the `title` field". Compared **vite-plugin-pwa** 2.0.0 (npm registry; https://vite-pwa-org.netlify.app/guide/: generates manifest + a Workbox service worker, pulls in workbox-build) with a **hand-written manifest + small service worker** (gist example https://gist.github.com/deadflowers/2995ace4d1ec6d6f23ceb508d0f7eff2, whose param names don't match its script: a bug to avoid). Picked hand-written: no new dependency, we only need the app shell offline.
- `app/src/share.ts` + test: `readShare` (query → title/text/url, each capped at 4,000 chars), `linkFromShare` (first valid http(s) link in url, then text, then title; trims stuck-on punctuation but keeps `wiki/Alien_(film)`), `itemFromShare` (YouTube → video; else Course draft).
- `App.tsx` `receiveShare`: on open with share data, clears it from the address bar first (no double save on reload), saves at once (video titles from oEmbed), shows the To do tab with the new row rising in, the count popping and a toast. Duplicate → "Already saved" + opens its sheet. No link → says nothing was saved.
- `app/public/manifest.webmanifest` (name, icons incl. maskable, Glow colors, standalone, `share_target` GET with action `./`), `app/public/sw.js` (network-first for pages with the saved copy offline, cache-first for built files; skips other sites), registered in `main.tsx` for the built app only.
- `vite.config.ts` `base: '/stash/'` (GitHub Pages project URL). Preview and e2e now use http://localhost:PORT/stash/.
- `.github/workflows/deploy.yml`: on push to main, `npm ci`, `npm test`, build, deploy `app/dist` to Pages (actions pinned as in Vite's docs, https://vite.dev/guide/static-deploy).
- e2e renamed `app/e2e/app.cjs`: 12 checks (7 video + share from YouTube app, Chrome course page, duplicate, no-link share, reload, and the install pieces: service worker ready, manifest share_target, icons load).
- GitHub's plans page (https://docs.github.com/en/get-started/learning-about-github/githubs-plans): on GitHub Free, "GitHub Pages in public repositories" only, so the repo must be public.

## 5e. What exists (step 4, the other sections)
- `app/src/items.ts`: optional fields per section (`description`, `tags`, `author`, `provider`, `is_paid`, `price`, `credential_url`, `image_at`, `proof_name`, `proof_at`, `size`, `difficulty`). Optional, so older items and backups work unchanged. Plus `missingDetails` (required fields), `subtitle` (the line under a title, such as "Coursera, $49 a month" or "1/3 done, M"), `parseTags`, and checklist edits (`addStep`, `toggleStep`, `renameStep`, `removeStep`, `moveStep`). All tested.
- `app/src/files.ts` + test: screenshots and proofs in their own IndexedDB database `stash-files` (idb-keyval opens one store per database), keyed `<item id>/image` and `<item id>/proof`. `checkFile` (images only for screenshots; images or PDF for proofs; 20 MB input, 10 MB PDF), `fitWithin` (1600 px long side) and `shrink` (canvas to WebP, quality 0.82; keeps the original if that's smaller). Nothing ever deletes a file; a new one replaces the old under the same key.
- **Image shrinking research (rule 4, 2026-11-26).** Compared **browser-image-compression** 2.0.2 (npm registry; repo github.com/Donaldcwl/browser-image-compression; last release March 2023) and **compressorjs** 1.4.0 (npm registry; repo github.com/fengyuanchen/compressorjs; 2 extra dependencies). I read their READMEs in the npm packages. Both use the browser's canvas `toBlob` underneath, so we use the platform directly (`createImageBitmap` + canvas `toBlob`), about 20 lines and no new dependency. Unverified: EXIF rotation of phone photos (`createImageBitmap` is meant to apply it by default; screenshots don't have any).
- `app/src/backup.ts` + test: version 2 adds `files` (data URLs); checks each file's key belongs to an item and its type is an image or PDF; rejects anything else with a clear message. Max backup 100 MB (shortcut comment in `App.tsx`).
- `app/src/AddItem.tsx` (tiles + section form), `Fields.tsx` (shared fields, `LinkField` keeps only real http(s) links, `FilePick` checks and shrinks), `Checklist.tsx`, `Details.tsx` (section chips, fields, checklist, Proof, open link, status, archive), `useFileUrl.ts` (shows a saved file). Certificates show their screenshot as the cover.
- `App.tsx`: `edit()` merges each change into the newest copy of the item, so fast typing never undoes another field. Backups now read everything with `loadAllItems()` (archived too).
- `app/e2e/app.cjs`: 19 checks. The new ones (13–19): course with link check and tags; book draft; certificate with a 3000×2000 screenshot shrunk to 1600×1067 WebP and a wrong file type refused; proof PDF and credential link; project with steps (add, tick, reorder) and the Now card progress; course moved to Books with its name kept; backup with archived items and both files, restored on a fresh phone; a version 1 backup restored. Run: `cd app && npm run build && NODE_PATH=$(npm root -g) npm run e2e`.
- `.github/workflows/deploy.yml` now has two jobs: **build** (install, test, build, upload) and **deploy** (needs build). On 2026-11-26 the single-job version failed twice with "No artifacts named github-pages" right after a successful upload, and GitHub's status page showed no incident. The two-job version deployed fine. This session's GitHub token can't re-run workflows or start them by hand; a push to `main` (even an empty commit) starts a deploy.
- Live check 2026-11-26: on https://youssefabdelkawy.github.io/stash/ in a 390 px browser, + then Book then a name then Save; the book shows in To do with no errors.
- Gotcha: in tests, close any open Add page (Escape) before tapping + again. The open dialog blocks the page behind it.

## 6. Open items
- - Local-only questions, asked one at a time: (1) backup: DONE, backup file, (2) course auto-fill: DONE, typed in for now, (3) remove Supabase files: DONE, deleted.
- GitHub Pages is live (2026-11-18): repo public, Pages source = GitHub Actions, first deploy succeeded; https://youssefabdelkawy.github.io/stash/ checked over HTTPS (page, manifest, service worker, icons) and a share saved a real YouTube video with its real title and thumbnail in a phone-size browser. **Still to do: the owner installs it on the Android phone and shares from YouTube and Chrome.**
- Vercel is no longer used.
- Git: pushed to https://github.com/YoussefAbdelkawy/stash (branch `main`; must be public for GitHub Pages), 2026-11-18. Commit and push after every piece of work.

## 7. Next action
1. Owner: on the phone, install the app and share a YouTube video and a Chrome page to Stash (`docs/next/02-share-button.md`). Then try each new section: add a course, book, certificate (with a screenshot from the gallery) and project (add steps, tick them), move a shared link to Books, and download a backup. Report back what happened.
2. Then step 5 (search, tags and filters): `docs/next/04-search-tags-filters.md`.

**Ready-made prompts for new chats** (one per remaining piece, 2026-11-18): `docs/next/01-videos.md` (phone check), `02-share-button.md` (phone check), `03-sections.md` (step 4), `04-search-tags-filters.md` (step 5), `05-online-and-phone.md` (step 6), `06-android-app.md` (step 7). Paste one into a new Claude Code chat with this repo attached.

Prototypes: step 4 sections `prototypes/sections.html` (https://claude.ai/artifact/94LpAg14RULcrquAFAhovT); layout `prototypes/home.html`, motion `prototypes/motion.html`, look `prototypes/look.html`; step 2 `prototypes/videos.html` (https://claude.ai/artifact/A7ehh7y4qK57tUaDtR2zYg), step 3 icon `prototypes/icons.html` (https://claude.ai/artifact/KR1Apn8wckg548fkjjMSoX).
