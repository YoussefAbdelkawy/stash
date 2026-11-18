import { useState } from 'react'
import { STATUS_LABEL, type Item, type Status } from './items'
import { Cover, Icon } from './Icon'

const STATUSES: Status[] = ['todo', 'doing', 'done']

// Tapping an item opens this sheet (owner's pick): open it, rename it, move it, or archive it.
export function Details({ item, close, onRename, onMove, onArchive }: {
  item: Item
  close: () => void
  onRename: (title: string) => void
  onMove: (status: Status) => void
  onArchive: () => void
}) {
  const [title, setTitle] = useState(item.title ?? '')

  return (
    <>
      <span className="grab" />
      {item.section === 'video' && <Cover section="video" url={item.url} />}
      <div className="field">
        <label htmlFor="title">Title</label>
        <input id="title" type="text" value={title} placeholder="Add a title" onChange={(e) => { setTitle(e.target.value); onRename(e.target.value) }} />
      </div>
      {item.url && (
        <a className="primary" href={item.url} target="_blank" rel="noreferrer">
          <Icon name="play" />{item.section === 'video' ? 'Open in YouTube' : 'Open link'}
        </a>
      )}
      <div className="field">
        <span className="label" id="status-label">Status</span>
        <div className="status" role="group" aria-labelledby="status-label">
          {STATUSES.map((s) => (
            <button key={s} aria-pressed={item.status === s} onClick={() => s !== item.status && onMove(s)}>{STATUS_LABEL[s]}</button>
          ))}
        </div>
      </div>
      <div className="two">
        <button className="ghost" onClick={close}><Icon name="check" />Done</button>
        <button className="ghost danger" onClick={onArchive}><Icon name="archive" />Archive</button>
      </div>
      <p className="hint">Archive hides it from your lists. Nothing is deleted.</p>
    </>
  )
}
