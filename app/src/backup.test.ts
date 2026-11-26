import { describe, expect, it } from 'vitest'
import { makeBackup, parseBackup } from './backup'
import type { Item } from './items'

const book: Item = {
  id: 'b1', section: 'book', status: 'todo', is_draft: false, title: 'Atomic Habits',
  url: null, checklist: [], created_at: '2026-11-01T00:00:00Z',
}
const cert: Item = { ...book, id: 'c1', section: 'cert', title: 'Google Data Analytics', image_at: '2026-11-20T00:00:00Z', proof_name: 'cert.pdf' }
const png = 'data:image/webp;base64,UklGRg=='
const pdf = 'data:application/pdf;base64,JVBERi0='

describe('backup', () => {
  it('round-trips items and files through a backup file', () => {
    const files = { 'c1/image': png, 'c1/proof': pdf }
    expect(parseBackup(makeBackup([book, cert], files))).toEqual({ items: [book, cert], files })
  })

  it('still restores version 1 backups, which have no files', () => {
    const old = JSON.stringify({ app: 'stash', version: 1, items: [book] })
    expect(parseBackup(old)).toEqual({ items: [book], files: {} })
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

  it('rejects damaged or unexpected files', () => {
    const withFiles = (files: unknown) => JSON.stringify({ app: 'stash', version: 2, items: [cert], files })
    expect(() => parseBackup(withFiles({ 'c1/image': 'data:text/html;base64,PGgxPg==' }))).toThrow(/images or proofs/)
    expect(() => parseBackup(withFiles({ 'other/image': png }))).toThrow(/images or proofs/)
    expect(() => parseBackup(withFiles({ 'c1/script': png }))).toThrow(/images or proofs/)
    expect(() => parseBackup(withFiles({ 'c1/image': 42 }))).toThrow(/images or proofs/)
    expect(() => parseBackup(withFiles([png]))).toThrow(/files list/)
  })
})
