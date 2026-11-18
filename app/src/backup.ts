import type { Item } from './items'

const SECTIONS = ['video', 'course', 'cert', 'book', 'project']
const STATUSES = ['todo', 'doing', 'done']

// shortcut: items only, no images yet; add images (as base64) when step 4 brings screenshots.
export function makeBackup(items: Item[]): string {
  return JSON.stringify({ app: 'stash', version: 1, exportedAt: new Date().toISOString(), items })
}

// The file comes from outside the app, so check every item before trusting it.
export function parseBackup(text: string): Item[] {
  let data: { app?: string; items?: unknown }
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('This file is not a Stash backup (it is not valid JSON).')
  }
  if (data?.app !== 'stash' || !Array.isArray(data.items)) {
    throw new Error('This file is not a Stash backup. Pick a file made with "Download backup".')
  }
  data.items.forEach((raw, n) => {
    const i = raw as Partial<Item>
    if (typeof i.id !== 'string' || !SECTIONS.includes(i.section as string) || !STATUSES.includes(i.status as string)) {
      throw new Error(`The backup is damaged at item ${n + 1}. Nothing was restored.`)
    }
  })
  return data.items as Item[]
}
