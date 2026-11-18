import { describe, expect, it } from 'vitest'
import { itemFromShare, linkFromShare, readShare } from './share'

describe('readShare', () => {
  it('reads title, text and url from the share link Android opens', () => {
    expect(readShare('?title=Hi&text=Look+https%3A%2F%2Fyoutu.be%2FrfscVS0vtbw')).toEqual({ title: 'Hi', text: 'Look https://youtu.be/rfscVS0vtbw', url: null })
    expect(readShare('')).toBeNull()
    expect(readShare('?tab=todo')).toBeNull()
  })
})

describe('itemFromShare', () => {
  const at = '2026-11-18T12:00:00.000Z'

  it('makes a YouTube share a video in To do', () => {
    expect(itemFromShare({ text: 'Learn Python https://youtu.be/rfscVS0vtbw?si=x' }, 'id1', at)).toEqual({
      id: 'id1', section: 'video', status: 'todo', is_draft: true, title: null,
      url: 'https://youtu.be/rfscVS0vtbw?si=x', checklist: [], created_at: at,
    })
  })

  it('saves any other link as a Course draft, keeping the page title Chrome sends', () => {
    expect(itemFromShare({ title: 'CS50 - Harvard', url: 'https://cs50.harvard.edu/x/' }, 'id2', at)).toMatchObject({
      section: 'course', is_draft: true, title: 'CS50 - Harvard', url: 'https://cs50.harvard.edu/x/',
    })
  })

  it('returns null when the share has no usable link', () => {
    expect(itemFromShare({ text: 'just words' }, 'id3', at)).toBeNull()
  })
})

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
