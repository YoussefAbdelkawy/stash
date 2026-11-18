export type Status = 'todo' | 'doing' | 'done'
export type Section = 'video' | 'course' | 'cert' | 'book' | 'project'

export type Item = {
  id: string
  section: Section
  status: Status
  is_draft: boolean
  title: string | null
  url: string | null
  checklist: { text: string; done: boolean }[]
  created_at: string
  archived_at?: string | null
}

export const STATUS_LABEL: Record<Status, string> = { todo: 'To do', doing: 'Doing', done: 'Done' }
export const SECTION_LABEL: Record<Section, string> = {
  video: 'Videos', course: 'Courses', cert: 'Certificates', book: 'Books', project: 'Projects',
}
// One item of a section, for labels like "Now, Project".
export const SECTION_ONE: Record<Section, string> = { video: 'Video', course: 'Course', cert: 'Certificate', book: 'Book', project: 'Project' }

// Tapping an item moves it along: To do → Doing → Done → back to To do.
export function nextStatus(s: Status): Status {
  return s === 'todo' ? 'doing' : s === 'doing' ? 'done' : 'todo'
}

// The "Now" card: the Doing item started most recently.
export function pickNow(items: Item[]): Item | undefined {
  return items
    .filter((i) => i.status === 'doing')
    .sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
}

export function randomTodo(items: Item[], random = Math.random): Item | undefined {
  const todo = items.filter((i) => i.status === 'todo')
  return todo[Math.floor(random() * todo.length)]
}

// A draft (or an item with no title yet) gets the "Needs details" badge.
export function needsDetails(i: Item): boolean {
  return i.is_draft || !i.title
}

// "3/7 done" for a project checklist. Returns null when there is no checklist yet.
export function checklistProgress(i: Item): { done: number; total: number } | null {
  if (!i.checklist.length) return null
  return { done: i.checklist.filter((c) => c.done).length, total: i.checklist.length }
}

// What to call an item everywhere: its title, else its link (quick-saved drafts), else "Untitled".
export const displayTitle = (i: Item) => i.title || i.url || 'Untitled'
