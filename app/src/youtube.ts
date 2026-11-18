const MAX_LINK = 2000
const YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com']

// Links come from outside the app (typed, pasted, shared), so check them before use.
export function cleanLink(text: string): string | null {
  const link = text.trim()
  if (link.length > MAX_LINK) return null
  try {
    return ['http:', 'https:'].includes(new URL(link).protocol) ? link : null
  } catch {
    return null
  }
}

// The 11-character video id from any common YouTube link shape, or null.
export function youTubeId(text: string): string | null {
  const link = cleanLink(text)
  if (!link) return null
  const url = new URL(link)
  let id: string | null | undefined
  if (url.hostname === 'youtu.be') id = url.pathname.slice(1)
  else if (YOUTUBE_HOSTS.includes(url.hostname)) {
    id = url.pathname === '/watch' ? url.searchParams.get('v') : url.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1]
  }
  return id && /^[\w-]{11}$/.test(id) ? id : null
}

export const thumbnailUrl = (id: string) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`

// YouTube's free oEmbed endpoint allows browser requests (checked 2026-11-18). Any failure → null, and the item saves as a Draft.
export async function fetchTitle(link: string): Promise<string | null> {
  try {
    const reply = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(link)}&format=json`, { signal: AbortSignal.timeout(5000) })
    if (!reply.ok) return null
    const data = await reply.json()
    return typeof data?.title === 'string' && data.title.trim() ? data.title.trim() : null
  } catch {
    return null
  }
}
