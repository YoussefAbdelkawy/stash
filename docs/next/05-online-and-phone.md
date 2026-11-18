# Stash · 5 of 6 · Online hosting and the phone

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
The plan said Vercel. The owner switched to **GitHub Pages** (free; the repo must stay public on a free account). Pages is **already live** at https://youssefabdelkawy.github.io/stash/: every push to `main` runs `.github/workflows/deploy.yml` (install, test, build, deploy). **Vercel is not used.**

**Still missing:** a confirmed install on the owner's real Android phone, and a clear way for the owner to get updates and keep their data safe.

## What to do in this chat
1. **Check that the live site is healthy:**
   - The last run of the deploy workflow succeeded (`gh run list --repo YoussefAbdelkawy/stash --limit 3`, if `gh` works here).
   - The page, `manifest.webmanifest`, `sw.js` and the icons load over HTTPS.
   - A 390 px Playwright screenshot of the live URL.
2. **Phone install steps:** give the owner a numbered list (open the link in Chrome, ⋮ menu, Install app) and get the result with one clickable question. Steps 2 to 6 of file 2 cover sharing; don't repeat them if already done.
3. **How updates reach the phone.**
   - Read `app/public/sw.js` and explain, in plain words for the owner, what happens after a new deploy (for example, whether closing and reopening Stash is enough).
   - Verify by deploying a small visible change and watching it arrive. Don't state it from memory.
   - If updates can get stuck, propose a fix as a clickable question before building it.
4. **Data safety on the phone.**
   - Confirm `navigator.storage.persist()` is granted on the installed app (show the result in a temporary test or the console; don't guess).
   - Remind the owner that uninstalling the app or clearing Chrome's site data erases everything, and that **Backup** (the download icon) is the only copy.
   - Check that a backup file can be restored on the phone.
5. **Clean up the stale notes** (ask before deleting anything): HANDOFF §5 still lists the Vercel plugin and CLI. Update it to say GitHub Pages, and mark §4 step 6 DONE once the phone install is confirmed.
6. **Recap** for the owner: the link, how to install, how updates arrive, and how to back up.

## Out of scope here
A custom domain (not in HANDOFF and may cost money), and analytics or tracking (the data stays on the phone).
