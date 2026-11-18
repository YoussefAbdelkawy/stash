# Stash · 4 of 6 · Search, tags and filters

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
From HANDOFF §3 "Finding things":
- one search box covering titles, descriptions and tags
- topic tags across all sections
- filters by section and by status

This brings in the two remaining pieces of the chosen Focus layout: the **search box** under the header and the **bottom section bar** (All, Videos, Courses, Certificates, Books, Projects). Both were shown in `prototypes/look.html` (Glow look) and `prototypes/home.html`.

**Do file 3 (sections) first**, so there are descriptions and tags to search.

## Steps
1. **Prototypes first (rule 1).** Make at least 2 clickable options in the Glow look with Cinematic motion, and ask one clickable question at a time:
   1. Search: **A** always visible under the header (as in the chosen layout, recommended); or **B** an icon that expands.
   2. Tags: **A** tap a tag chip on an item to filter by it; or **B** a tag row under the search box. Also how tags are typed: comma-separated vs pressing Enter.
   3. What the Now card does while a filter is on: show the Doing item from that section only (recommended), or hide the card.
   4. The search results view: the normal tabs filtered (recommended), or one flat list across all statuses.
2. **Logic, test-first, in its own small file** (for example `app/src/search.ts`):
   - Matching ignores upper/lower case and accents. Check how Arabic text matches, since the owner may save Arabic titles: test real examples and ask the owner if unsure.
   - Search, the section filter and the status tab combine.
   - Archived items are never shown.
   - An empty query shows everything.
   - In-memory filtering is fine for one person's list. Add a `shortcut:` comment saying when to change that (thousands of items).
3. **Tags:**
   - Saved per item, as already added in file 3.
   - Trim them, lowercase them for matching, drop duplicates, and limit their length.
   - Pick from tags you already used, so the same topic doesn't get typed two ways.
4. **Empty states** (STANDARDS §7): "Nothing matches" must say what to do next, for example clear the search or pick All.
5. **Tests.**
   - Vitest for `search.ts`: case, accents, Arabic, tags, combined filters, archived items.
   - Extend `app/e2e/app.cjs`: type a search, tap a section in the bottom bar, tap a tag, clear them, and check the counts in the tabs.
   - 390 px screenshots in light and dark.
   - Check that the bottom bar doesn't cover the last row or the + button. Keep the + button reachable.
6. **Update HANDOFF.md** with the picks, the files, and §4 step 5 DONE. Commit and push, and check the deploy.

## Out of scope here
Saved searches, sorting options and AI search are not in HANDOFF. Ask the owner first if they come up.
