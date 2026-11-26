import { useState } from 'react'
import { SECTION_ONE, missingDetails, type Item, type Section } from './items'
import { AddVideo } from './AddVideo'
import { Fields } from './Fields'
import { Cover, Icon } from './Icon'

const SECTIONS: Section[] = ['video', 'course', 'cert', 'book', 'project']
const BLURB: Record<Section, string> = {
  video: 'Paste a YouTube link', course: 'Link, name, what it teaches', cert: 'Provider, price, screenshot',
  book: 'Name and author', project: 'Goal, steps, size',
}

// The + button opens this page (owner's pick A): five section tiles first, then that section's own form.
export function AddItem({ items, close, onSave, onOpen }: {
  items: Item[]
  close: () => void
  onSave: (item: Item, image?: Blob | null) => void
  onOpen: (item: Item) => void
}) {
  const [section, setSection] = useState<Section | null>(null)
  if (section === 'video') return <AddVideo items={items} close={() => setSection(null)} onSave={onSave} onOpen={onOpen} />
  if (section) return <SectionForm key={section} section={section} back={() => setSection(null)} onSave={onSave} />
  return (
    <>
      <div className="topbar">
        <button className="iconbtn" onClick={close} aria-label="Close"><Icon name="back" /></button>
        <h2>Add to Stash</h2>
        <span className="iconbtn-space" />
      </div>
      <p className="hint">What are you saving?</p>
      <div className="tiles">
        {SECTIONS.map((s) => (
          <button key={s} className="tile" onClick={() => setSection(s)}>
            <Cover section={s} />
            <b>{SECTION_ONE[s]}</b>
            <small>{BLURB[s]}</small>
          </button>
        ))}
      </div>
    </>
  )
}

function SectionForm({ section, back, onSave }: { section: Section; back: () => void; onSave: (item: Item, image?: Blob | null) => void }) {
  const [item, setItem] = useState<Item>(() => ({
    id: crypto.randomUUID(), section, status: 'todo', is_draft: false, title: null, url: null, checklist: [], created_at: '',
  }))
  const [image, setImage] = useState<Blob | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const missing = missingDetails(item)

  function pickImage(blob: Blob) {
    if (preview) URL.revokeObjectURL(preview)
    setImage(blob)
    setPreview(URL.createObjectURL(blob))
  }

  function save() {
    const now = new Date().toISOString()
    onSave({ ...item, is_draft: missing.length > 0, created_at: now, image_at: image ? now : null }, image)
  }

  return (
    <>
      <div className="topbar">
        <button className="iconbtn" onClick={back} aria-label="Back to sections"><Icon name="back" /></button>
        <h2>New {SECTION_ONE[section].toLowerCase()}</h2>
        <span className="iconbtn-space" />
      </div>
      <Fields item={item} onChange={(patch) => setItem((i) => ({ ...i, ...patch }))} screenshot={preview} onScreenshot={pickImage} />
      {section === 'project' && <p className="hint">After saving, its sheet opens so you can add the goal steps.</p>}
      <button className={missing.length ? 'primary draft' : 'primary'} onClick={save}>
        <Icon name={missing.length ? 'edit' : 'check'} />{missing.length ? 'Save as Draft' : 'Save to To do'}
      </button>
      {missing.length > 0 && <p className="hint center">Missing {missing.join(' and ')}: it saves anyway with "Needs details".</p>}
    </>
  )
}
