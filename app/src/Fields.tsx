import { useRef, useState, type ReactNode } from 'react'
import { DIFFICULTY_LABEL, SIZE_LABEL, parseTags, type Difficulty, type Item, type Size } from './items'
import { checkFile, shrink } from './files'
import { cleanLink } from './youtube'
import { Icon } from './Icon'

const NAME = { video: 'Title', course: 'Course name', cert: 'Certificate name', book: 'Book name', project: 'Project name' }
const EXAMPLE = { video: 'Add a title', course: 'The Odin Project', cert: 'Google Data Analytics', book: 'Atomic Habits', project: 'Budget tracker app' }

// The fields each section has (HANDOFF "Section details"). The Add page and the detail sheet both use this.
// Every field saves as you type; nothing here blocks saving.
export function Fields({ item, onChange, screenshot, onScreenshot }: {
  item: Item
  onChange: (patch: Partial<Item>) => void
  screenshot?: string | null // a link to the saved or picked screenshot, to show it
  onScreenshot?: (image: Blob) => void
}) {
  const s = item.section
  return (
    <>
      <div className="field">
        <label htmlFor="f-title">{NAME[s]}</label>
        <input id="f-title" type="text" value={item.title ?? ''} placeholder={EXAMPLE[s]} maxLength={300}
          onChange={(e) => onChange({ title: e.target.value || null })} />
      </div>
      {(s === 'course' || s === 'cert') && (
        <LinkField id="f-link" label={s === 'cert' ? 'Sign-up link' : 'Link'} value={item.url} onChange={(url) => onChange({ url })} />
      )}
      {s === 'course' && <TextArea id="f-desc" label="What it teaches (optional)" example="Full-stack JavaScript, free" value={item.description} onChange={(description) => onChange({ description })} />}
      {s === 'cert' && (
        <>
          <Text id="f-provider" label="Provider" example="Coursera" value={item.provider} onChange={(provider) => onChange({ provider })} />
          <Choice label="Cost" value={item.is_paid ? 'paid' : 'free'} options={{ free: 'Free', paid: 'Paid' }} onPick={(v) => onChange({ is_paid: v === 'paid' })} />
          {item.is_paid && <Text id="f-price" label="Price" example="$49 a month" value={item.price} onChange={(price) => onChange({ price })} />}
          {onScreenshot && (
            <FilePick label="Screenshot (optional)" allowPdf={false} onPick={onScreenshot}
              current={screenshot ? <><img className="drop-img" src={screenshot} alt="" />Change screenshot</> : <><Icon name="image" />Add a screenshot (from a video or the site)</>} />
          )}
        </>
      )}
      {s === 'book' && <Text id="f-author" label="Author (optional)" example="James Clear" value={item.author} onChange={(author) => onChange({ author })} />}
      {s === 'project' && (
        <>
          <TextArea id="f-goal" label="Goal (optional)" example="Track my monthly spending with charts" value={item.description} onChange={(description) => onChange({ description })} />
          <Choice label="Size" value={item.size} options={SIZE_LABEL} onPick={(v) => onChange({ size: v === item.size ? null : (v as Size) })} />
          <Choice label="Difficulty" value={item.difficulty} options={DIFFICULTY_LABEL} onPick={(v) => onChange({ difficulty: v === item.difficulty ? null : (v as Difficulty) })} />
        </>
      )}
      <TagsField tags={item.tags ?? []} onChange={(tags) => onChange({ tags })} />
    </>
  )
}

function Text({ id, label, example, value, onChange }: { id: string; label: string; example: string; value?: string | null; onChange: (v: string | null) => void }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" value={value ?? ''} placeholder={example} maxLength={300} onChange={(e) => onChange(e.target.value || null)} />
    </div>
  )
}

function TextArea({ id, label, example, value, onChange }: { id: string; label: string; example: string; value?: string | null; onChange: (v: string | null) => void }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} value={value ?? ''} placeholder={example} maxLength={2000} rows={3} onChange={(e) => onChange(e.target.value || null)} />
    </div>
  )
}

// Keeps what you typed on screen, but only saves a real http(s) link (or nothing).
export function LinkField({ id, label, value, onChange }: { id: string; label: string; value?: string | null; onChange: (url: string | null) => void }) {
  const [text, setText] = useState(value ?? '')
  const bad = text.trim() !== '' && !cleanLink(text)
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="url" inputMode="url" autoComplete="off" placeholder="https://…" value={text}
        onChange={(e) => { setText(e.target.value); onChange(cleanLink(e.target.value)) }} />
      {bad && <p className="hint err">That doesn't look like a link. Check it starts with https://.</p>}
    </div>
  )
}

function TagsField({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [text, setText] = useState(tags.join(', '))
  return (
    <div className="field">
      <label htmlFor="f-tags">Topic tags (optional, comma between)</label>
      <input id="f-tags" type="text" autoComplete="off" placeholder="react, javascript" value={text}
        onChange={(e) => { setText(e.target.value); onChange(parseTags(e.target.value)) }} />
    </div>
  )
}

// A row of buttons where one is picked, like Free / Paid or S / M / L / XL.
function Choice({ label, value, options, onPick }: { label: string; value?: string | null; options: Record<string, string>; onPick: (v: string) => void }) {
  return (
    <div className="field">
      <span className="label" id={`choice-${label}`}>{label}</span>
      <div className="seg" role="group" aria-labelledby={`choice-${label}`}>
        {Object.entries(options).map(([v, text]) => (
          <button key={v} type="button" aria-pressed={value === v} onClick={() => onPick(v)}>{text}</button>
        ))}
      </div>
    </div>
  )
}

// Picks a screenshot or proof file, checks its type and size, and shrinks images before they're saved.
export function FilePick({ label, allowPdf, current, onPick }: {
  label: string; allowPdf: boolean; current: ReactNode; onPick: (file: Blob, name: string) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function picked(file?: File) {
    if (!file) return
    const problem = checkFile(file, allowPdf)
    if (problem) return setError(problem)
    setError('')
    setBusy(true)
    try {
      onPick(await shrink(file), file.name)
    } catch {
      setError("Couldn't read that file. Try another one.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="field">
      <span className="label">{label}</span>
      <button type="button" className="drop" onClick={() => input.current?.click()} disabled={busy}>{busy ? 'Shrinking it…' : current}</button>
      <input ref={input} type="file" hidden aria-label={label} accept={allowPdf ? 'image/*,application/pdf' : 'image/*'}
        onChange={(e) => { picked(e.target.files?.[0]); e.target.value = '' }} />
      {error && <p className="hint err" role="alert">{error}</p>}
    </div>
  )
}
