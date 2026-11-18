import { useEffect, useRef, useState } from 'react'
import { STATUS_LABEL, displayTitle, type Item } from './items'
import { cleanLink, fetchTitle, youTubeId } from './youtube'
import { Cover, Icon } from './Icon'

// The full-page "Add a video" flow (owner's pick B). Saving never waits on a missing title.
export function AddVideo({ items, close, onSave, onOpen }: {
  items: Item[]
  close: () => void
  onSave: (item: Item) => void
  onOpen: (item: Item) => void
}) {
  const [text, setText] = useState('')
  const [title, setTitle] = useState<string | null | undefined>() // undefined = still asking YouTube
  const [hint, setHint] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const pending = useRef<Promise<string | null>>(Promise.resolve(null))

  const id = youTubeId(text)
  const existing = id ? items.find((i) => i.section === 'video' && i.url && youTubeId(i.url) === id) : undefined
  const isDuplicate = !!existing

  // Ask YouTube once per video (not per keystroke), using the plain watch link.
  useEffect(() => {
    if (!id || isDuplicate) return
    let current = true
    pending.current = fetchTitle(`https://www.youtube.com/watch?v=${id}`)
    pending.current.then((t) => current && setTitle(t))
    return () => { current = false; setTitle(undefined) }
  }, [id, isDuplicate])

  async function paste() {
    try {
      setText(await navigator.clipboard.readText())
      setHint('')
    } catch {
      setHint("Couldn't read the clipboard. Long-press the box below and tap Paste.")
      input.current?.focus()
    }
  }

  async function save() {
    if (!id || existing) return
    const found = title === undefined ? await pending.current : title
    onSave({
      id: crypto.randomUUID(), section: 'video', status: 'todo', is_draft: !found, title: found,
      url: cleanLink(text), checklist: [], created_at: new Date().toISOString(),
    })
  }

  return (
    <>
      <div className="topbar">
        <button className="iconbtn" onClick={close} aria-label="Back"><Icon name="back" /></button>
        <h2>Add a video</h2>
        <span className="iconbtn-space" />
      </div>
      <button className="paste-big" onClick={paste}>
        <Icon name="paste" />Paste from clipboard<small>Copied a YouTube link? One tap.</small>
      </button>
      <p className="or">or type it</p>
      <div className="field">
        <label htmlFor="link">YouTube link</label>
        <input id="link" ref={input} type="url" inputMode="url" placeholder="https://youtu.be/…" autoComplete="off"
          value={text} onChange={(e) => { setText(e.target.value); setHint('') }} />
      </div>
      <div aria-live="polite">
        {hint ? <p className="hint err">{hint}</p>
          : !text.trim() ? <p className="hint">Works with youtube.com, youtu.be, Shorts and live links.</p>
          : !id ? <p className="hint err">That doesn't look like a YouTube link. Check it starts with https://youtube.com or https://youtu.be.</p>
          : existing ? (
            <div className="dupe">
              <span><b>Already saved</b> in {STATUS_LABEL[existing.status]}: {displayTitle(existing)}</span>
              <button onClick={() => onOpen(existing)}>Open it</button>
            </div>
          ) : (
            <div className="preview">
              <Cover section="video" url={text} />
              {title === undefined ? <><span className="shimmer" /><span className="meta">Getting the title from YouTube…</span></>
                : title ? <><strong>{title}</strong><span className="meta"><span className="dot" style={{ '--c': 'var(--video)' } as React.CSSProperties} />Video</span></>
                : <><strong>{cleanLink(text)}</strong><span className="meta"><span className="badge">Needs details</span>No title found. It still saves; add the title later.</span></>}
            </div>
          )}
      </div>
      <button className="primary" disabled={!id || !!existing} onClick={save}><Icon name="check" />Save to To do</button>
    </>
  )
}
