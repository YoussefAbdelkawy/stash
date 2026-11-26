import { describe, expect, it } from 'vitest'
import {
  addStep, checklistProgress, displayTitle, missingDetails, moveStep, needsDetails, nextStatus, parseTags, pickNow, randomTodo,
  removeStep, renameStep, subtitle, toggleStep, type Item,
} from './items'

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

  it('says what each section is missing before it stops being a Draft', () => {
    expect(missingDetails(item({}))).toEqual([])
    expect(missingDetails(item({ title: '  ' }))).toEqual(['a name'])
    expect(missingDetails(item({ section: 'video', title: null }))).toEqual(['a title'])
    expect(missingDetails(item({ section: 'course' }))).toEqual(['a link'])
    expect(missingDetails(item({ section: 'course', url: 'https://x.com' }))).toEqual([])
    expect(missingDetails(item({ section: 'project' }))).toEqual(['goal steps'])
    expect(missingDetails(item({ section: 'cert' }))).toEqual([])
    expect(needsDetails(item({ section: 'project' }))).toBe(true)
  })

  it('builds the small line under each title', () => {
    expect(subtitle(item({ section: 'course', url: 'https://www.theodinproject.com/paths' }))).toBe('theodinproject.com')
    expect(subtitle(item({ section: 'course', url: 'not a link' }))).toBe('')
    expect(subtitle(item({ section: 'cert', provider: 'Coursera', is_paid: true, price: '$49' }))).toBe('Coursera, $49')
    expect(subtitle(item({ section: 'cert', is_paid: true }))).toBe('Paid')
    expect(subtitle(item({ section: 'cert' }))).toBe('Free')
    expect(subtitle(item({ author: 'James Clear' }))).toBe('James Clear')
    expect(subtitle(item({}))).toBe('')
    const checklist = [{ text: 'a', done: true }, { text: 'b', done: false }]
    expect(subtitle(item({ section: 'project', checklist, size: 'M' }))).toBe('1/2 done, M')
  })

  it('cleans typed tags', () => {
    expect(parseTags('react, JavaScript ,react,, REACT ')).toEqual(['react', 'JavaScript'])
    expect(parseTags('')).toEqual([])
    expect(parseTags('x'.repeat(50))).toEqual(['x'.repeat(30)])
    expect(parseTags(Array.from({ length: 30 }, (_, n) => `t${n}`).join(','))).toHaveLength(20)
  })

  it('edits checklist steps without changing the old list', () => {
    const steps = [{ text: 'a', done: false }, { text: 'b', done: true }]
    expect(addStep(steps, '  c ')).toEqual([...steps, { text: 'c', done: false }])
    expect(addStep(steps, '   ')).toBe(steps)
    expect(toggleStep(steps, 0)[0].done).toBe(true)
    expect(steps[0].done).toBe(false)
    expect(renameStep(steps, 1, 'B')[1]).toEqual({ text: 'B', done: true })
    expect(removeStep(steps, 0)).toEqual([{ text: 'b', done: true }])
    expect(moveStep(steps, 1, -1).map((s) => s.text)).toEqual(['b', 'a'])
    expect(moveStep(steps, 0, -1)).toBe(steps)
    expect(moveStep(steps, 1, 1)).toBe(steps)
  })
})
