import { useState } from 'react'
import type { Section } from './items'
import { thumbnailUrl, youTubeId } from './youtube'
import { useFileUrl } from './useFileUrl'

// Fixed SVG paths written here in code (never user text), so inserting them as HTML is safe.
const PATHS = {
  all: '<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
  video: '<rect x="3" y="5" width="18" height="14" rx="3.5"/><path d="M10.5 9.2l4.6 2.8-4.6 2.8z" fill="currentColor"/>',
  course: '<path d="M2.5 9.5L12 5l9.5 4.5L12 14z"/><path d="M6.5 11.5v4.3c3.2 2.3 7.8 2.3 11 0v-4.3"/>',
  cert: '<circle cx="12" cy="9" r="5.5"/><path d="M8.8 13.6L7.5 21l4.5-2.6 4.5 2.6-1.3-7.4"/>',
  book: '<path d="M5 4.5A1.5 1.5 0 016.5 3H19v15H6.5A1.5 1.5 0 005 19.5z"/><path d="M5 19.5A1.5 1.5 0 006.5 21H19"/>',
  project: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 12.5l9 5 9-5"/><path d="M3 16.5l9 5 9-5"/>',
  dice: '<rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="15" cy="15" r="1.2" fill="currentColor"/><circle cx="15" cy="9" r="1.2" fill="currentColor"/><circle cx="9" cy="15" r="1.2" fill="currentColor"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  download: '<path d="M12 4v11"/><path d="M7.5 10.5L12 15l4.5-4.5"/><path d="M5 19h14"/>',
  upload: '<path d="M12 15V4"/><path d="M7.5 8.5L12 4l4.5 4.5"/><path d="M5 19h14"/>',
  chevron: '<path d="M9.5 6l6 6-6 6"/>',
  back: '<path d="M14.5 6l-6 6 6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  paste: '<rect x="6" y="4" width="12" height="17" rx="2.5"/><path d="M9.5 4V3h5v1"/><path d="M9.5 11h5M9.5 15h3"/>',
  play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>',
  archive: '<rect x="3" y="4" width="18" height="5" rx="1.5"/><path d="M5 9v10h14V9M10 13h4"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  up: '<path d="M6 15l6-6 6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  image: '<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-8 8"/>',
  file: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/>',
  link: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
}
export type IconName = keyof typeof PATHS

export function Icon({ name, className = 'icon' }: { name: IconName; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: PATHS[name] }} />
}

// A colored tile with the section's icon. Videos show their YouTube thumbnail, certificates their screenshot;
// both fall back to the tile when there's nothing to show (or the phone is offline).
export function Cover({ section, icon, url, image }: {
  section?: Section; icon?: IconName; url?: string | null; image?: { key: string; at: string } | null
}) {
  const [broken, setBroken] = useState(false)
  const saved = useFileUrl(image?.key ?? null, image?.at)
  const id = section === 'video' && url ? youTubeId(url) : null
  const src = saved ?? (id && !broken ? thumbnailUrl(id) : null)
  return (
    <span className={id ? 'cover thumb' : 'cover'} style={{ '--c': section ? `var(--${section})` : 'var(--accent)' } as React.CSSProperties}>
      {src
        ? <img src={src} alt="" loading="lazy" onError={() => setBroken(true)} />
        : <Icon name={icon ?? section ?? 'all'} />}
    </span>
  )
}
