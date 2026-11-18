import { cleanLink, youTubeId } from './youtube'
import type { Item } from './items'

export type Shared = { title?: string | null; text?: string | null; url?: string | null }

const MAX_FIELD = 4000

// Android opens Stash with ?title=…&text=…&url=… (manifest share_target, GET). null when the app was opened normally.
export function readShare(search: string): Shared | null {
  const q = new URLSearchParams(search)
  if (!['title', 'text', 'url'].some((k) => q.has(k))) return null
  const get = (k: string) => q.get(k)?.slice(0, MAX_FIELD) ?? null
  return { title: get('title'), text: get('text'), url: get('url') }
}

// A YouTube link becomes a video (its title is looked up after); anything else is a Course draft (owner's pick 2026-11-18).
// shortcut: other links always land in Courses; let the owner change the section once step 4 adds the other sections' fields.
export function itemFromShare(shared: Shared, id: string, createdAt: string): Item | null {
  const link = linkFromShare(shared)
  if (!link) return null
  const video = !!youTubeId(link)
  const pageTitle = shared.title?.trim()
  return {
    id, section: video ? 'video' : 'course', status: 'todo', is_draft: true,
    title: !video && pageTitle && pageTitle !== link ? pageTitle : null,
    url: link, checklist: [], created_at: createdAt,
  }
}

// Android's share sheet often leaves `url` empty and puts the link in `text` (or `title`), so check all three.
export function linkFromShare({ title, text, url }: Shared): string | null {
  for (const field of [url, text, title]) {
    for (const match of field?.match(/https?:\/\/\S+/g) ?? []) {
      let trimmed = match.replace(/[.,!?'"\]]+$/, '')
      if (trimmed.endsWith(')') && !trimmed.includes('(')) trimmed = trimmed.slice(0, -1) // "(see https://x)" but keep wiki/Alien_(film)
      const link = cleanLink(trimmed.replace(/[.,!?'"\]]+$/, ''))
      if (link) return link
    }
  }
  return null
}
