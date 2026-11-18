import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanLink, fetchTitle, thumbnailUrl, youTubeId } from './youtube'

const ID = 'rfscVS0vtbw'

describe('youTubeId', () => {
  it.each([
    `https://www.youtube.com/watch?v=${ID}`,
    `https://youtube.com/watch?v=${ID}&t=42s`,
    `https://m.youtube.com/watch?feature=share&v=${ID}`,
    `https://music.youtube.com/watch?v=${ID}&list=RDAMVM`,
    `https://youtu.be/${ID}`,
    `https://youtu.be/${ID}?si=AbC123xyz`,
    `https://www.youtube.com/shorts/${ID}`,
    `https://youtube.com/shorts/${ID}?feature=share`,
    `https://www.youtube.com/embed/${ID}`,
    `https://www.youtube.com/live/${ID}?si=x`,
    `  https://youtu.be/${ID}  `,
    `http://youtu.be/${ID}`,
  ])('reads the id from %s', (link) => {
    expect(youTubeId(link)).toBe(ID)
  })

  it.each([
    '',
    'not a link',
    'https://vimeo.com/123456789',
    'https://youtube.com/',
    'https://www.youtube.com/@freecodecamp',
    'https://www.youtube.com/watch?v=short',
    'https://notyoutube.com/watch?v=rfscVS0vtbw',
    'https://youtube.com.evil.com/watch?v=rfscVS0vtbw',
    `javascript:alert(1)//youtu.be/${ID}`,
    `ftp://youtu.be/${ID}`,
  ])('returns null for %s', (link) => {
    expect(youTubeId(link)).toBeNull()
  })
})

describe('cleanLink', () => {
  it('trims and keeps http(s) links only, up to 2000 characters', () => {
    expect(cleanLink('  https://example.com/a  ')).toBe('https://example.com/a')
    expect(cleanLink('mailto:me@example.com')).toBeNull()
    expect(cleanLink('example.com')).toBeNull()
    expect(cleanLink(`https://example.com/${'a'.repeat(2000)}`)).toBeNull()
  })
})

describe('thumbnailUrl', () => {
  it('points at the free YouTube thumbnail', () => {
    expect(thumbnailUrl(ID)).toBe(`https://img.youtube.com/vi/${ID}/hqdefault.jpg`)
  })
})

describe('fetchTitle', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('asks oEmbed for the title', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ title: 'Learn Python' })))
    vi.stubGlobal('fetch', fetch)
    expect(await fetchTitle(`https://youtu.be/${ID}`)).toBe('Learn Python')
    expect(fetch.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal) // never hangs Save on a slow network
    expect(fetch.mock.calls[0][0]).toBe(`https://www.youtube.com/oembed?url=https%3A%2F%2Fyoutu.be%2F${ID}&format=json`)
  })

  it('returns null when offline, on an error reply, or with no title', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))
    expect(await fetchTitle(`https://youtu.be/${ID}`)).toBeNull()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Not Found', { status: 404 })))
    expect(await fetchTitle(`https://youtu.be/${ID}`)).toBeNull()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}')))
    expect(await fetchTitle(`https://youtu.be/${ID}`)).toBeNull()
  })
})
