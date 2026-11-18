# Stash · 6 of 6 · Real Android app with Capacitor (later)

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
HANDOFF §4 step 7: wrap the web app into a real Android app with Capacitor. HANDOFF also postpones **course auto-fill** to this step: a native app *may* be able to read other sites' pages (title, description and image from og: tags), which the browser blocks. **This is unverified; prove it first.** Do files 1 to 5 before this one.

## Things to settle before any code
Ask these one at a time as clickable questions, with the facts checked first.

1. **Is it worth it?** The installed web app already appears in the Share menu. List what Capacitor would add for the owner (for example course auto-fill, and a share target that works without Chrome), each **verified in official Capacitor or Android docs**, not from memory. Then let the owner decide to go ahead or stay with the web app.
2. **Free forever.** Capacitor itself, Android Studio and the Android SDK must be free; check their licenses. Publishing on Google Play needs a paid developer account, so check the current fee on Google's page; any fee breaks the free-forever rule. The free route is installing the APK file directly on the phone (sideloading). Ask the owner which route to take.
3. **Where the app gets built.** A cloud Claude container may not have the Android SDK and can't plug into a phone. Options to compare (verify each is free):
   - Android Studio on the owner's computer
   - a GitHub Actions workflow that builds the APK and attaches it to a release
4. **The data doesn't move by itself.** The Capacitor app is a different app from the installed web app, with its own storage, so items won't carry over. The way across is the existing **Backup** then **Restore**. Test it, and tell the owner clearly before they switch.

## Steps (after the owner says go)
1. **Research first (rule 4):**
   - Read the official Capacitor docs for adding Android to an existing Vite app.
   - Compare at least 2 open-source ways to receive Android share intents in Capacitor (search GitHub and npm, and cite only what you opened).
   - Check the official docs for a native HTTP option to fetch course pages for auto-fill.
   - Write the choices plus links in HANDOFF.md.
2. **Prototypes (rule 1)** for anything visual that changes. For example, how course auto-fill shows its result before saving: the fields are editable before saving (HANDOFF).
3. **Build in small steps, each checked:**
   1. The app opens and shows the same screens.
   2. Data saves and survives a restart.
   3. Backup and restore work, including images.
   4. Sharing from YouTube and Chrome saves at once (same rules as `app/src/share.ts`; reuse it).
   5. Course auto-fill, with tests for reading og: tags.

   Keep the web app working too: GitHub Pages keeps deploying from `main`.
4. **Tests:** Vitest for any new logic (og: tag reading, intent parsing); the existing e2e still passes for the web build; and a manual check on the phone (install the APK, share, restore a backup), with the result written in the recap.
5. **Update HANDOFF.md** with the decisions, the files, the build steps the owner can repeat, and §4 step 7. Commit and push.

## Out of scope here
iPhone (left out of v1), push notifications and reminders (left out of v1), and any paid service.
