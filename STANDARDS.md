# STANDARDS — the rules this project never breaks
Read this before every task, and re-read it whenever you are unsure. If a request or an idea conflicts with this file or HANDOFF.md, stop and ask the owner. Never guess.

## 1. Source of truth
- HANDOFF.md = what we build (decisions, sections, build order). STANDARDS.md = how we build it.
- Do not add sections, fields, features, libraries or services that are not in HANDOFF.md. Anything new goes to the owner first as a multiple-choice question, then into HANDOFF.md.
- When a decision changes, update HANDOFF.md in the same task, so the file never goes stale.

## 2. No hallucination
- Never state a price, limit, API shape, library option or config key from memory as fact. Check the official docs or the installed package (`node_modules/<pkg>`), or say "unverified".
- Never claim something works without running it: tests pass, the build passes, and a Playwright screenshot on a phone-sized screen for anything visual.
- If a check fails or was skipped, say so plainly in the recap.
- Never invent URLs, package names or GitHub repos. Only cite ones you actually opened.

## 3. Owner's working rules (copied from HANDOFF.md §2: same rules, never weaker)
- Prototype first: at least 2 usable prototypes for any visual or feature. The owner picks one, then build only that one.
- Finish the whole job. Don't offer to continue: continue.
- Ask before deleting anything: files, tables, rows, buckets, branches, projects, deployments.
- Unfamiliar feature → search GitHub first. Compare 2+ open-source approaches, pick one, note the choice and links in HANDOFF.md, then build.
- Recap at the end: key points first, plain words, written for someone who saw none of the work.
- Questions: one per reply, multiple choice, recommended option first.
- Free forever: no paid tier, no credit card, and no service that needs one.

## 4. Fixed tech stack (do not swap without asking)
| Layer | Choice |
|---|---|
| UI | React + Vite + TypeScript |
| Data and files | On the phone only: IndexedDB via idb-keyval. No account, no server. Backup = a downloaded file. (Owner's change 2026-11-18.) |
| Hosting | Vercel (free plan), static Vite build |
| Phone | PWA with a Web Share Target (Android Chrome); Capacitor later |
| Tests | Vitest for logic, Playwright for screens |

Add a new dependency only when there's no simpler option (platform API → existing dependency → a few lines of code).

## 5. Code rules
- Smallest complete change (ponytail). No "for later" code, no abstractions nobody asked for.
- The code must be readable by a learner: plain names, short files, and a one-line comment only for the why.
- Known limits get a comment: `shortcut: <limit>, <when to upgrade>`.
- Every non-trivial piece of logic (link parsing, share-target handling, checklist progress, search) has a test.
- After each edit: type check plus lint (hook). Before saying "done": `npm run build`, the tests, and a phone-size screenshot.

## 6. Data and security
- Data never leaves the phone except in a backup file the owner downloads.
- No secrets in git. `.env` is in `.gitignore`.
- Validate every link and file the app receives (share target, uploads, backup files): check the type, check the size, and compress images before upload.
- Never delete user data without asking. Prefer a soft delete or archive.

## 7. UX rules
- Mobile first (about 390 px wide), then desktop.
- Motion: respect the phone's reduce-motion setting; animate only transform and opacity.
- Saving must be as fast as WhatsApp: one Share tap. Never block saving because fields are missing; save it as a Draft with a "Needs details" badge.
- Every list has a helpful empty state. Every error says what happened and what to do next.
- Accessible: real buttons and labels, visible focus, enough color contrast.

## 8. Definition of done (all must be true)
- [ ] The owner picked this option from 2+ prototypes
- [ ] It matches HANDOFF.md, and HANDOFF.md is updated if anything changed
- [ ] Tests, type check, lint and build pass, and you actually ran them
- [ ] Phone-size screenshot checked
- [ ] Nothing deleted without asking
- [ ] Plain-words recap given
