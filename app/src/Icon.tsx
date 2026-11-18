import type { Section } from './items'

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
}
export type IconName = keyof typeof PATHS

export function Icon({ name, className = 'icon' }: { name: IconName; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: PATHS[name] }} />
}

// A colored tile with the section's icon; stands in until real thumbnails arrive in step 2.
export function Cover({ section, icon }: { section?: Section; icon?: IconName }) {
  return (
    <span className="cover" style={{ '--c': section ? `var(--${section})` : 'var(--accent)' } as React.CSSProperties}>
      <Icon name={icon ?? section ?? 'all'} />
    </span>
  )
}
