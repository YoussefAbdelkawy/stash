# Stash · 3 of 6 · Courses, Certificates, Books, Projects

> **Paste this whole file into a new Claude Code chat** with the repo https://github.com/YoussefAbdelkawy/stash attached.
>
> **To Claude:** first read `HANDOFF.md` and `STANDARDS.md` in the repo root, and follow every rule in them. The key ones:
> - Prototypes first (2+ options, the owner picks).
> - Questions one at a time as clickable multiple choice (AskUserQuestion), recommended option first, and keep working in the same turn.
> - Research before writing an unfamiliar feature.
> - Free forever.
> - Ask before deleting anything.
> - Tests, type check, lint, build and a 390 px Playwright screenshot before saying done.
> - Commit and push to `main` after each piece of work (that deploys to GitHub Pages).
> - End with a plain-words recap.
>
> If this file and HANDOFF.md disagree, HANDOFF.md wins. Ask the owner if unsure. Never guess.

## Goal
Add the other four sections from HANDOFF §3 "Section details", plus:
- saving any of them as a Draft
- moving a shared draft to the right section
- images in backups
- editing and archiving for every section

Today only Videos can be added. Shared non-YouTube links land in Courses as drafts.

## What each section holds (from HANDOFF; don't add fields without asking)
| Section | Fields |
|---|---|
| Courses | link, title (typed; no auto-fill until Capacitor), optional description, topic tags |
| Certificates | name, screenshot (image), provider, sign-up link, free or paid plus price, status. Once earned: proof (PDF or image) and credential URL. Works as an achievements wallet for a CV. |
| Books | name, optional author, status, tags |
| Projects | optional goal description, goal checklist (shows "3/7 done"; the checklist is required, but a Draft may have it empty), size S / M / L / XL, difficulty Beginner / Mid / Advanced |

All sections: To do / Doing / Done, "Needs details" when fields are missing, never blocked from saving, archive instead of delete.

## Steps
1. **Prototypes first (rule 1).** Build one clickable page in the Glow look with Cinematic motion (see `app/src/index.css` and `motion.ts`), and publish it as an artifact. Ask one clickable question at a time:
   1. How you add an item: **A** a section picker, then that section's own form; or **B** one smart form that changes with the section chosen at the top.
   2. Certificates: how "earned" works. For example, **A** a "Mark earned" step that asks for the proof; or **B** proof fields always visible in the detail sheet. Also how the achievements wallet looks.
   3. Projects: how the checklist is edited (add, tick, reorder?) and how size and difficulty are picked.
   4. How you move a shared draft to the right section: a section chooser in its detail sheet (recommended).
2. **Research before images (rule 4).** For image compression in the browser, compare at least 2 approaches (for example, the plain canvas `toBlob` API vs an open-source library) and write the choice plus links in HANDOFF.md.
   - Prefer the platform (canvas) unless a library is clearly needed.
   - STANDARDS §6: check the file type and size, and compress before saving.
3. **Data.**
   - Add the new fields to `Item` in `app/src/items.ts` as optional, so items saved earlier keep working without a migration. Test this with an old backup file.
   - Store images in IndexedDB as Blobs, in their own idb-keyval store (`createStore`), keyed by id.
   - Never put images in the item list itself.
4. **Backups with images.**
   - Remove the `shortcut:` in `app/src/backup.ts`: images go into the backup file (for example as base64), and restore puts them back.
   - Keep the validation: reject damaged or oversized files with a clear message.
   - Old backups with no images must still restore.
   - Tests: a round trip with images, an old-format backup, and a damaged image entry.
5. **Build the chosen screens.** Reuse the parts that already exist:
   - `Panel.tsx` (native dialog) for screens and sheets
   - `Details.tsx` for the detail sheet (extend it per section)
   - `Cover` in `Icon.tsx` for the tiles
   - `checklistProgress` for "3/7 done"

   The section colors are already defined: course blue, certificate violet, book amber, project teal.
6. **Tests.**
   - Vitest for every new piece of logic: field checks, "needs details" per section, checklist edits, image size and type checks, backup with images.
   - Extend `app/e2e/app.cjs`: add one of each section, a draft for each, edit, archive, move a shared draft to Books, back up then restore with an image, and reload keeps everything.
   - 390 px screenshots in light and dark.
7. **Update HANDOFF.md** with the picks, the files, the gotchas, and §4 step 4 DONE. Commit and push to `main`, then check the GitHub Pages deploy succeeded.

## Out of scope here
- Search, tags filtering and the bottom section bar: file 4. Tags are typed and saved here, but filtering by them comes in file 4.
- Course auto-fill: file 6.
- Linking a certificate to a course: left out of v1.
