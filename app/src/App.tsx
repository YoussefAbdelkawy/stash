import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { askToKeepData, loadItems, saveItem, saveItems } from './store'
import { makeBackup, parseBackup } from './backup'
import {
  checklistProgress, displayTitle, needsDetails, pickNow, randomTodo,
  SECTION_ONE, STATUS_LABEL, type Item, type Status,
} from './items'
import {
  celebrateDone, flyToTab, highlight, playOpening, pop, riseIn, slideTabs, spinReel, toastIn,
} from './motion'
import { Cover, Icon } from './Icon'
import { Panel } from './Panel'
import { AddVideo } from './AddVideo'
import { Details } from './Details'
import './App.css'

const MAX_BACKUP_BYTES = 20 * 1024 * 1024
const TABS: Status[] = ['doing', 'todo', 'done']

export default function App() {
  const [items, setItems] = useState<Item[] | null>(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Status>('doing')
  const [toast, setToast] = useState('')
  const [panel, setPanel] = useState<{ kind: 'add' } | { kind: 'item'; id: string } | null>(null)
  // shortcut: date is read once when the app opens; refresh it on resume if the app stays open past midnight.
  const [today] = useState(() => new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }))
  const screen = useRef<HTMLElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const busy = useRef(false) // ignore taps while an animation is playing

  useEffect(() => {
    askToKeepData()
    loadItems()
      .then((list) => {
        flushSync(() => setItems(list))
        playOpening(screen.current!)
      })
      .catch(() => setError("Couldn't open your saved items. Close and reopen the app; if it keeps happening, restore a backup."))
  }, [])

  useEffect(() => {
    if (!toast) return
    toastIn(document.querySelector('.toast'))
    const timer = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  const $ = (selector: string) => screen.current!.querySelector(selector)

  // Wraps every tap: one action at a time, so animations never overlap.
  async function once(action: () => Promise<void>) {
    if (busy.current) return
    busy.current = true
    try { await action() } finally { busy.current = false }
  }

  async function store(item: Item) {
    try {
      await saveItem(item)
      return true
    } catch {
      setToast(`Couldn't save "${displayTitle(item)}". Your phone may be out of space. Try again.`)
      return false
    }
  }

  async function update(next: Item) {
    if (!(await store(next))) return false
    setItems((list) => list!.map((i) => (i.id === next.id ? next : i)))
    return true
  }

  async function add(item: Item) {
    if (!(await store(item))) return false
    flushSync(() => { setTab('todo'); setItems((list) => [item, ...list!]) })
    riseIn($(`[data-id="${item.id}"]`))
    setToast(item.title ? `Saved to To do: ${item.title}` : 'Saved as a Draft. Add the title when you have a minute.')
    return true
  }

  async function archive(item: Item) {
    if (!(await store({ ...item, archived_at: new Date().toISOString() }))) return
    setItems((list) => list!.filter((i) => i.id !== item.id))
    setToast(`Archived: ${displayTitle(item)}`)
  }

  const rename = (item: Item, typed: string) => {
    const title = typed.trim() || null
    update({ ...item, title, is_draft: !title })
  }

  const moveTo = (item: Item, status: Status) => once(async () => {
    if (!(await store({ ...item, status }))) return
    await flyToTab($(`[data-id="${item.id}"]`), $(`[data-tab="${status}"]`))
    flushSync(() => setItems((list) => list!.map((i) => (i.id === item.id ? { ...i, status } : i))))
    pop($(`[data-tab="${status}"] .count`))
    setToast(`Moved to ${STATUS_LABEL[status]}: ${displayTitle(item)}`)
  })

  const finish = (item: Item) => once(async () => {
    if (!(await store({ ...item, status: 'done' }))) return
    await celebrateDone(screen.current!, $('.now'))
    flushSync(() => setItems((list) => list!.map((i) => (i.id === item.id ? { ...i, status: 'done' } : i))))
    riseIn($('.now'))
    setToast(`Done: ${displayTitle(item)}`)
  })

  const pickRandom = () => once(async () => {
    const pick = randomTodo(items ?? [])
    if (!pick) return setToast('Nothing in To do yet.')
    const titles = (items ?? []).filter((i) => i.status === 'todo').map((i) => displayTitle(i))
    const reel = spinReel($('.reel-track') as HTMLElement, titles, displayTitle(pick))
    await new Promise((r) => setTimeout(r, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1850))
    highlight($(`[data-id="${pick.id}"]`))
    setToast(`Random pick: ${displayTitle(pick)}`)
    await reel
  })

  function changeTab(next: Status) {
    if (next === tab) return
    const direction = TABS.indexOf(next) > TABS.indexOf(tab) ? 1 : -1
    slideTabs(direction, () => flushSync(() => setTab(next)))
  }

  function downloadBackup() {
    const blob = new Blob([makeBackup(items ?? [])], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `stash-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(link.href)
    setToast('Backup saved to your Downloads. Keep a copy in Google Drive to be safe.')
  }

  async function restore(file: File | undefined) {
    if (!file) return
    if (file.size > MAX_BACKUP_BYTES) return setToast('That file is too big to be a Stash backup (over 20 MB).')
    try {
      await saveItems(parseBackup(await file.text()))
      setItems(await loadItems())
      setToast('Backup restored. Items you already had were kept.')
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Couldn't restore that file.")
    }
  }

  const list = items ?? []
  const openItem = panel?.kind === 'item' ? list.find((i) => i.id === panel.id) : undefined
  const now = pickNow(list)
  const progress = now && checklistProgress(now)
  const rows = list.filter((i) => i.status === tab && i !== now)
  const count = (s: Status) => list.filter((i) => i.status === s).length

  return (
    <main className="screen" ref={screen}>
      <header className="top">
        <div>
          <p className="date">{today}</p>
          <h1 className="hello"><span>Keep</span> <span>going</span></h1>
          <p className="sub">{count('doing')} in progress, {count('todo')} waiting</p>
        </div>
        <div className="actions">
          <button className="iconbtn" onClick={downloadBackup} aria-label="Download backup" title="Download backup"><Icon name="download" /></button>
          <button className="iconbtn" onClick={() => fileInput.current?.click()} aria-label="Restore a backup" title="Restore a backup"><Icon name="upload" /></button>
          <input ref={fileInput} type="file" accept="application/json,.json" hidden aria-label="Choose a backup file"
            onChange={(e) => { restore(e.target.files?.[0]); e.target.value = '' }} />
        </div>
      </header>

      {error && <p className="error" role="alert">{error}</p>}

      {now && (
        <section className="now" aria-label="Now">
          <div className="sweep" />
          <button className="now-open" onClick={() => setPanel({ kind: 'item', id: now.id })} aria-label={`${displayTitle(now)}. Open details`}>
            <Cover section={now.section} url={now.url} />
            <span>
              <span className="kicker"><i />Now, {SECTION_ONE[now.section]}</span>
              <h2>{displayTitle(now)}</h2>
            </span>
          </button>
          <div className="now-foot">
          {progress && (
            <div className="bar" role="img" aria-label={`${progress.done} of ${progress.total} steps done`}>
              <i style={{ transform: `scaleX(${progress.done / progress.total})` }} />
            </div>
          )}
          <div className="now-row">
            <span>{progress ? `${progress.done}/${progress.total} steps done` : STATUS_LABEL[now.status]}</span>
            <button className="done-btn" onClick={() => finish(now)}><Icon name="check" />Mark done</button>
          </div>
          </div>
        </section>
      )}

      <div className="tabs" role="group" aria-label="Show items by status">
        <span className="pill" style={{ transform: `translateX(${TABS.indexOf(tab) * 100}%)` }} />
        {TABS.map((s) => (
          <button key={s} data-tab={s} aria-pressed={tab === s} onClick={() => changeTab(s)}>
            {STATUS_LABEL[s]} <span className="count">{count(s)}</span>
          </button>
        ))}
      </div>

      <div className="list">
        {tab === 'todo' && rows.length > 0 && (
          <button className="row" onClick={pickRandom}>
            <Cover icon="dice" />
            <span>
              <strong className="reel"><span className="reel-track"><span>Random pick</span></span></strong>
              <span className="meta">Can't choose? Let Stash pick one.</span>
            </span>
            <Icon name="chevron" className="icon chevron" />
          </button>
        )}
        {items === null && !error && <p className="empty">Loading your items…</p>}
        {items !== null && rows.length === 0 && (
          <div className="empty">
            <Cover icon={tab === 'done' ? 'check' : 'all'} />
            <span>
              {list.length === 0
                ? 'Nothing saved yet. Tap + to add a YouTube video. Have a backup? Tap the restore button at the top.'
                : tab === 'done'
                  ? 'Nothing finished yet. Your wins will collect here.'
                  : `Nothing in ${STATUS_LABEL[tab]}. Open an item in another tab and set its status to ${STATUS_LABEL[tab]}.`}
            </span>
          </div>
        )}
        {rows.map((i) => (
          <button key={i.id} data-id={i.id} className="row" onClick={() => setPanel({ kind: 'item', id: i.id })}
            aria-label={`${displayTitle(i)}, ${STATUS_LABEL[i.status]}${needsDetails(i) ? ', needs details' : ''}. Open details`}>
            <Cover section={i.section} url={i.url} />
            <span>
              <strong>{displayTitle(i)}</strong>
              <span className="meta"><span className="dot" style={{ '--c': `var(--${i.section})` } as React.CSSProperties} />{SECTION_ONE[i.section]}</span>
            </span>
            {needsDetails(i) ? <span className="badge">Needs details</span> : <Icon name="chevron" className="icon chevron" />}
          </button>
        ))}
      </div>

      <button className="fab" onClick={() => setPanel({ kind: 'add' })} aria-label="Add a video"><Icon name="plus" /></button>

      {panel?.kind === 'add' && (
        <Panel kind="page" label="Add a video" onClose={() => setPanel(null)}>
          {(close) => (
            <AddVideo items={list} close={close} onOpen={(i) => setPanel({ kind: 'item', id: i.id })}
              onSave={async (item) => { if (await add(item)) close() }} />
          )}
        </Panel>
      )}
      {openItem && (
        <Panel key={openItem.id} kind="sheet" label={displayTitle(openItem)} onClose={() => setPanel(null)}>
          {(close) => (
            <Details item={openItem} close={close} onRename={(t) => rename(openItem, t)}
              onMove={async (s) => { await close(); moveTo(openItem, s) }}
              onArchive={async () => { await close(); archive(openItem) }} />
          )}
        </Panel>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  )
}
