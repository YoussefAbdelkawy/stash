export type Status = 'todo' | 'doing' | 'done'
export type Section = 'video' | 'course' | 'cert' | 'book' | 'project'
export type Size = 'S' | 'M' | 'L' | 'XL'
export type Difficulty = 'beginner' | 'mid' | 'advanced'
export type Step = { text: string; done: boolean }

export type Item = {
  id: string
  section: Section
  status: Status
  is_draft: boolean
  title: string | null
  url: string | null
  checklist: Step[]
  created_at: string
  archived_at?: string | null
  // Step 4 fields. All optional, so items saved before step 4 (and old backups) still work as they are.
  description?: string | null // courses: what it teaches; projects: the goal
  tags?: string[]
  author?: string | null // books
  provider?: string | null // certificates
  is_paid?: boolean // certificates
  price?: string | null // certificates, free text such as "$49 a month"
  credential_url?: string | null // certificates, once earned
  image_at?: string | null // certificates: when a screenshot was saved in the files store (see files.ts)
  proof_name?: string | null // certificates: file name of the saved proof (PDF or image)
  proof_at?: string | null // certificates: when that proof was saved
  size?: Size | null // projects
  difficulty?: Difficulty | null // projects
}

export const SIZE_LABEL: Record<Size, string> = { S: 'S · weekend', M: 'M · 1–2 weeks', L: 'L · a month', XL: 'XL · months' }
export const DIFFICULTY_LABEL: Record<Difficulty, string> = { beginner: 'Beginner', mid: 'Mid', advanced: 'Advanced' }

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

// What each section needs before it stops being a Draft. Everything else is optional.
export function missingDetails(i: Item): string[] {
  const missing: string[] = []
  if (!i.title?.trim()) missing.push(i.section === 'video' ? 'a title' : 'a name')
  if (i.section === 'course' && !i.url) missing.push('a link')
  if (i.section === 'project' && !i.checklist.length) missing.push('goal steps')
  return missing
}

// A draft, or an item missing required fields, gets the "Needs details" badge.
export function needsDetails(i: Item): boolean {
  return i.is_draft || missingDetails(i).length > 0
}

// The small line under a title in the list, for example "Coursera, $49 a month" or "3/7 done, M".
export function subtitle(i: Item): string {
  const host = i.url ? safeHost(i.url) : ''
  const progress = checklistProgress(i)
  const parts = {
    video: [],
    course: [host],
    cert: [i.provider, i.is_paid ? i.price || 'Paid' : 'Free'],
    book: [i.author],
    project: [progress && `${progress.done}/${progress.total} done`, i.size],
  }[i.section]
  return parts.filter(Boolean).join(', ')
}

const safeHost = (link: string) => { try { return new URL(link).hostname.replace(/^www\./, '') } catch { return '' } }

// Tags typed as "react, JavaScript ,react" → ["react", "JavaScript"]: trimmed, no empties, no repeats (any case).
export function parseTags(text: string): string[] {
  const seen = new Set<string>()
  return text.split(',').map((t) => t.trim().slice(0, 30)).filter((t) => {
    const key = t.toLowerCase()
    if (!t || seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, 20)
}

// Checklist edits (project goal steps). Each returns a new list and leaves the old one untouched.
export const addStep = (steps: Step[], text: string) => (text.trim() ? [...steps, { text: text.trim().slice(0, 200), done: false }] : steps)
export const toggleStep = (steps: Step[], n: number) => steps.map((s, k) => (k === n ? { ...s, done: !s.done } : s))
export const renameStep = (steps: Step[], n: number, text: string) => steps.map((s, k) => (k === n ? { ...s, text: text.slice(0, 200) } : s))
export const removeStep = (steps: Step[], n: number) => steps.filter((_, k) => k !== n)
export function moveStep(steps: Step[], n: number, by: -1 | 1): Step[] {
  const to = n + by
  if (to < 0 || to >= steps.length) return steps
  const next = [...steps];
  [next[n], next[to]] = [next[to], next[n]]
  return next
}

// "3/7 done" for a project checklist. Returns null when there is no checklist yet.
export function checklistProgress(i: Item): { done: number; total: number } | null {
  if (!i.checklist.length) return null
  return { done: i.checklist.filter((c) => c.done).length, total: i.checklist.length }
}

// What to call an item everywhere: its title, else its link (quick-saved drafts), else "Untitled".
export const displayTitle = (i: Item) => i.title || i.url || 'Untitled'
