# HANDOFF — "Stash" (placeholder name): personal learning-backlog app
Last updated: 2026-11-18. Status: LOCAL-ONLY storage (owner, 2026-11-18). Step 1 rebuilt and tested locally with Cinematic motion and the Glow look (owner's picks). Next: step 2 (Videos).

## 1. The problem
The owner keeps finding courses, YouTube videos, books, certificates to aim for, and project ideas. They send them to themselves on WhatsApp, and they get lost in the endless messages and never get done. The goal: one place that stores all of this, makes it easy to find again, and pushes items toward "done". Build it first as a web app, then turn it into an Android app.

## 2. Working rules (the owner's instructions — follow every time)
See also STANDARDS.md: the fixed stack, no-hallucination rules, security, and the definition of done. Re-read it whenever unsure.

- **Prototype before building.** Before fully building any visual or feature, show a usable demo or clickable prototype, at least 2 options, so the owner can accept or reject one. Build only the chosen one.
- **Finish the whole job before stopping.** Don't offer to continue; continue.
- **Ask before deleting anything** (files, tables, data, branches, projects).
- **Don't write an unfamiliar feature from scratch.** Search GitHub for open-source projects that do it first, compare their approaches, then start.
- **End every piece of work with a recap** for someone who saw none of it: key points first, plain words.
- **Interview style when asking questions:** one question per reply, as multiple choice, with a recommended option.
- **Everything must be free forever** (no paid tiers, no credit card).

## 3. Decisions made (from the planning interview)
| Area | Decision |
|---|---|
| Phone | Android |
| Saving things | Installed web app (PWA) that appears in Android's Share menu: tap Share in YouTube or Chrome, pick the app, and it saves at once. Uses the Web Share Target API (Chrome on Android only). |
| Tech stack | React + Vite. **All data stays on the phone** (owner's decision 2026-11-18, replaces Supabase): no account, no sign-in, no cloud database. The app files are still served once from free Vercel hosting so the PWA can be installed. Later wrapped into a real Android app with Capacitor. |
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
| Backup | 'Download backup' button saves one file to the phone (owner can put it in Google Drive); 'Restore' loads it back. No automatic reminder. (Owner's pick 2026-11-18.) |
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
2. Videos section.
3. Share button (installable PWA plus share target). The app becomes usable from here.
4. Courses (typed in; auto-fill waits for Capacitor), Certificates, Books, Projects.
5. Search, tags and filters.
6. Deploy to Vercel and install on the phone.
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

## 6. Open items
- Pick the app's name ("Stash" is a placeholder).
- Local-only questions, asked one at a time: (1) backup: DONE, backup file, (2) course auto-fill: DONE, typed in for now, (3) remove Supabase files: DONE, deleted.
- Owner must authorize the Vercel connection (hosting only).
- Git: local repo on branch `main` (step 1 committed 2026-11-18). Owner chose to push to a new GitHub repo; waiting for the owner to create an empty repo and give its name.

## 7. Next action
Step 2 (Videos): prototypes are up in `prototypes/videos.html` (artifact https://claude.ai/artifact/A7ehh7y4qK57tUaDtR2zYg): add flow A bottom sheet / B full page, the proposed detail sheet on tap, and "Already saved" for duplicates. Ask the owner, one at a time: (1) add flow A/B, (2) tap opens the detail sheet?, (3) duplicates say "Already saved"? Then build.
