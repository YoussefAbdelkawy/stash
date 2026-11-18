import { cleanLink } from './youtube'

export type Shared = { title?: string | null; text?: string | null; url?: string | null }

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
