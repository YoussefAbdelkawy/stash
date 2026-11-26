import type { Item } from './items'

const SECTIONS = ['video', 'course', 'cert', 'book', 'project']
const STATUSES = ['todo', 'doing', 'done']
const FILE_TYPES = /^data:(image\/[a-z+.-]+|application\/pdf);base64,/

// files: screenshots and proofs as data URLs, keyed "<item id>/image" or "<item id>/proof" (see files.ts).
export type Backup = { items: Item[]; files: Record<string, string> }

export function makeBackup(items: Item[], files: Record<string, string> = {}): string {
  return JSON.stringify({ app: 'stash', version: 2, exportedAt: new Date().toISOString(), items, files })
}

// The file comes from outside the app, so check every item and file before trusting it.
// Version 1 backups (before step 4) have no files and still restore.
export function parseBackup(text: string): Backup {
  let data: { app?: string; items?: unknown; files?: unknown }
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
  const items = data.items as Item[]
  const ids = new Set(items.map((i) => i.id))
  const files = (data.files ?? {}) as Record<string, unknown>
  if (typeof files !== 'object' || Array.isArray(files)) throw new Error('The backup is damaged (its files list). Nothing was restored.')
  for (const [key, value] of Object.entries(files)) {
    const [id, kind] = key.split('/')
    if (!ids.has(id) || !['image', 'proof'].includes(kind) || typeof value !== 'string' || !FILE_TYPES.test(value)) {
      throw new Error('The backup is damaged (one of its images or proofs). Nothing was restored.')
    }
  }
  return { items, files: files as Record<string, string> }
}
