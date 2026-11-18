import { describe, expect, it } from 'vitest'
import { linkFromShare } from './share'

describe('linkFromShare', () => {
  it('finds the link the YouTube app puts in text (Android leaves url empty)', () => {
    expect(linkFromShare({ title: '', text: 'Learn Python - Full Course https://youtu.be/rfscVS0vtbw?si=AbC123', url: '' }))
      .toBe('https://youtu.be/rfscVS0vtbw?si=AbC123')
  })

  it('takes Chrome\'s url field first', () => {
    expect(linkFromShare({ title: 'Example', text: 'see https://other.example', url: 'https://example.com/page' }))
      .toBe('https://example.com/page')
  })

  it('looks in title as a last resort', () => {
    expect(linkFromShare({ title: 'https://example.com/a', text: 'no link here' })).toBe('https://example.com/a')
  })

  it('drops punctuation stuck to the end of a link', () => {
    expect(linkFromShare({ text: 'Watch this (https://youtu.be/rfscVS0vtbw).' })).toBe('https://youtu.be/rfscVS0vtbw')
    expect(linkFromShare({ text: 'https://en.wikipedia.org/wiki/Alien_(film)' })).toBe('https://en.wikipedia.org/wiki/Alien_(film)')
  })

  it('returns null when nothing valid was shared', () => {
    expect(linkFromShare({})).toBeNull()
    expect(linkFromShare({ title: 'Just a note', text: 'no links' })).toBeNull()
    expect(linkFromShare({ text: 'javascript:alert(1)', url: 'ftp://files.example' })).toBeNull()
    expect(linkFromShare({ text: `https://example.com/${'a'.repeat(2000)}` })).toBeNull()
  })
})
