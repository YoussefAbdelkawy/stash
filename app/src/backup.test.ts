import { describe, expect, it } from 'vitest'
import { makeBackup, parseBackup } from './backup'
import type { Item } from './items'

const book: Item = {
  id: 'b1', section: 'book', status: 'todo', is_draft: false, title: 'Atomic Habits',
  url: null, checklist: [], created_at: '2026-11-01T00:00:00Z',
}

describe('backup', () => {
  it('round-trips items through a backup file', () => {
    expect(parseBackup(makeBackup([book]))).toEqual([book])
  })

  it('rejects files that are not a Stash backup', () => {
    expect(() => parseBackup('not json')).toThrow(/not a Stash backup/)
    expect(() => parseBackup('{"hello":1}')).toThrow(/not a Stash backup/)
  })

  it('rejects items with an unknown section or status', () => {
    const bad = (over: object) => JSON.stringify({ app: 'stash', version: 1, items: [{ ...book, ...over }] })
    expect(() => parseBackup(bad({ section: 'movie' }))).toThrow(/item 1/)
    expect(() => parseBackup(bad({ status: 'later' }))).toThrow(/item 1/)
    expect(() => parseBackup(bad({ id: 5 }))).toThrow(/item 1/)
  })
})
