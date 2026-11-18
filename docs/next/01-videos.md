# Stash · 1 of 6 · Videos: finish and check

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

## Where it stands
**Built** (HANDOFF §5c): paste a YouTube link on the full-page Add screen and see the real thumbnail and title. There's a detail sheet (rename, open in YouTube, To do / Doing / Done, archive) and "Already saved" for duplicates. A link with no title is saved as a Draft. The automated checks are in `app/e2e/app.cjs`.

**Not yet confirmed:** that it works on the owner's real Android phone.

## What to do in this chat
1. **Run the checks** to confirm the repo is healthy: `cd app && npm ci && npm run typecheck && npm run lint && npm test && npm run build && NODE_PATH=$(npm root -g) npm run e2e` (Playwright is preinstalled in Claude Code cloud containers; `NODE_PATH` lets the e2e script find it). Report anything that fails.
2. **Get the owner's phone report.** Ask the owner (one clickable question) whether they have tried on the phone, at https://youssefabdelkawy.github.io/stash/:
   - adding a video by pasting a link
   - seeing its thumbnail and title
   - opening it in YouTube from the detail sheet
   - renaming it
   - moving it between To do / Doing / Done
   - archiving it

   If they haven't, give them that list as a short numbered checklist and wait for the result.
3. **Fix anything the phone test shows.** Find the root cause first, then the smallest change, with a test that reproduces the bug before the fix.
4. **Record the result.** Mark "Videos: tested on phone (date)" in HANDOFF.md §4 and §6.

## Out of scope here
Anything not in HANDOFF.md. New ideas, such as video length, a "watched up to" time, or playlists, go to the owner as a question first and then into HANDOFF.md. Don't build them in this chat.
