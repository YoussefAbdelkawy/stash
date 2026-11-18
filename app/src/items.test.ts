import { describe, expect, it } from 'vitest'
import { checklistProgress, displayTitle, needsDetails, nextStatus, pickNow, randomTodo, type Item } from './items'

const item = (over: Partial<Item>): Item => ({
  id: '1', section: 'book', status: 'todo', is_draft: false, title: 'A book',
  url: null, checklist: [], created_at: '2026-11-01T00:00:00Z', ...over,
})

describe('items', () => {
  it('cycles status To do → Doing → Done → To do', () => {
    expect(nextStatus('todo')).toBe('doing')
    expect(nextStatus('doing')).toBe('done')
    expect(nextStatus('done')).toBe('todo')
  })

  it('picks the newest Doing item for the Now card', () => {
    const list = [
      item({ id: 'old', status: 'doing', created_at: '2026-01-01T00:00:00Z' }),
      item({ id: 'new', status: 'doing', created_at: '2026-06-01T00:00:00Z' }),
      item({ id: 'todo', status: 'todo', created_at: '2026-12-01T00:00:00Z' }),
    ]
    expect(pickNow(list)?.id).toBe('new')
    expect(pickNow([item({})])).toBeUndefined()
  })

  it('random pick only chooses from To do', () => {
    const list = [item({ id: 'a', status: 'doing' }), item({ id: 'b' }), item({ id: 'c' })]
    expect(randomTodo(list, () => 0)?.id).toBe('b')
    expect(randomTodo(list, () => 0.99)?.id).toBe('c')
    expect(randomTodo([item({ status: 'done' })])).toBeUndefined()
  })

  it('flags drafts and untitled items as needing details', () => {
    expect(needsDetails(item({}))).toBe(false)
    expect(needsDetails(item({ is_draft: true }))).toBe(true)
    expect(needsDetails(item({ title: null }))).toBe(true)
  })

  it('counts checklist progress', () => {
    expect(checklistProgress(item({}))).toBeNull()
    const checklist = [{ text: 'a', done: true }, { text: 'b', done: false }, { text: 'c', done: true }]
    expect(checklistProgress(item({ checklist }))).toEqual({ done: 2, total: 3 })
  })

  it('names an item by title, else link, else Untitled', () => {
    expect(displayTitle(item({}))).toBe('A book')
    expect(displayTitle(item({ title: null, url: 'https://youtu.be/x' }))).toBe('https://youtu.be/x')
    expect(displayTitle(item({ title: null }))).toBe('Untitled')
  })
})
