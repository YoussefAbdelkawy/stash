# Stash · 2 of 6 · Share button: phone test and fixes

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
**Built** (HANDOFF §5d):
- An installable app: manifest, service worker and icons.
- An Android share target: in YouTube or Chrome, tap Share, then Stash, and it saves at once.
- YouTube links become Videos (title from oEmbed). Other links become Course drafts with "Needs details".
- Duplicates show "Already saved".

It's live at https://youssefabdelkawy.github.io/stash/ and checked in a phone-size browser. **Not yet tested on the owner's real phone.**

## What to do in this chat
1. **Give the owner these phone steps** as a short numbered list (Chrome on Android):
   1. Open https://youssefabdelkawy.github.io/stash/ in Chrome.
   2. Open the ⋮ menu, then **Install app** (or **Add to Home screen**). Open Stash from the new icon once.
   3. In the YouTube app, open a video, tap **Share**, then **Stash**. Check that it lands in To do with the right title and thumbnail.
   4. In Chrome, open any course page, tap **Share**, then **Stash**. Check that it lands as a Course draft with "Needs details".
   5. Share the same video again. Check that it says "Already saved".
   6. Turn on airplane mode and open Stash. Check that it still opens and shows your items.
2. **Ask for the result** (one clickable question): all worked / Stash missing from the Share menu / it saved wrong / something else.
3. **If Stash isn't in the Share menu:**
   - Verify against the official Chrome docs (https://developer.chrome.com/docs/capabilities/web-apis/web-share-target), not memory.
   - Common causes to check: the app isn't installed (only installed apps appear), Chrome is too old, or the `share_target` in `app/public/manifest.webmanifest` doesn't match what Chrome expects. Also, an old install keeps an old manifest: uninstall, then reinstall.
4. **If it saves the wrong thing:**
   - Ask the owner to share once more, then copy the address shown, or describe exactly what was saved.
   - Add that exact case to `app/src/share.test.ts` first, then fix `linkFromShare` / `itemFromShare`.
5. **Record the result** in HANDOFF.md §4 and §6: step 3 "tested on phone (date)", plus anything learned.

## Out of scope here
Choosing the section for a shared non-YouTube link. That belongs to file 3 (sections), because the sections it would choose between don't exist yet.
