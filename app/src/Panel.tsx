import { useEffect, useState, type ReactNode } from 'react'
import { panelIn, panelOut } from './motion'

type Kind = 'sheet' | 'page'

// A native <dialog>: the browser handles focus, the Back/Escape key and the dimmed background.
export function Panel({ kind, label, onClose, children }: {
  kind: Kind
  label: string
  onClose: () => void
  children: (close: () => Promise<void>) => ReactNode
}) {
  const [dialog, setDialog] = useState<HTMLDialogElement | null>(null)

  useEffect(() => {
    if (!dialog) return
    dialog.showModal()
    panelIn(dialog, kind)
    return () => dialog.close()
  }, [dialog, kind])

  async function close() {
    await panelOut(dialog, kind)
    onClose()
  }

  return (
    <dialog ref={setDialog} className={kind} aria-label={label}
      onCancel={(e) => { e.preventDefault(); close() }}
      onClick={(e) => { if (e.target === e.currentTarget) close() }}>
      <div className="panel">{children(close)}</div>
    </dialog>
  )
}
