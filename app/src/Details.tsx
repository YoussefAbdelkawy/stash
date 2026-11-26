import { SECTION_ONE, STATUS_LABEL, type Item, type Section, type Status } from './items'
import { fileKey, type FileKind } from './files'
import { useFileUrl } from './useFileUrl'
import { Fields, FilePick, LinkField } from './Fields'
import { Checklist } from './Checklist'
import { Cover, Icon } from './Icon'

const STATUSES: Status[] = ['todo', 'doing', 'done']
const SECTIONS: Section[] = ['video', 'course', 'cert', 'book', 'project']

// Tapping an item opens this sheet (owner's pick): every field edits in place and saves as you type.
export function Details({ item, close, onChange, onFile, onMove, onArchive, onAllStepsDone }: {
  item: Item
  close: () => void
  onChange: (patch: Partial<Item>) => void
  onFile: (kind: FileKind, file: Blob, name: string) => void
  onMove: (status: Status) => void
  onArchive: () => void
  onAllStepsDone: () => void
}) {
  const screenshot = useFileUrl(item.image_at ? fileKey(item.id, 'image') : null, item.image_at)

  return (
    <>
      <span className="grab" />
      {/* Section chips on every sheet (owner's pick A), so a shared link can become a book, a project… */}
      <div className="field">
        <span className="label" id="section-label">Section</span>
        <div className="chips" role="group" aria-labelledby="section-label">
          {SECTIONS.map((s) => (
            <button key={s} className="chip" aria-pressed={item.section === s} style={{ '--c': `var(--${s})` } as React.CSSProperties}
              onClick={() => s !== item.section && onChange({ section: s })}>
              <Icon name={s} />{SECTION_ONE[s]}
            </button>
          ))}
        </div>
      </div>
      {item.section === 'video' && <Cover section="video" url={item.url} />}
      <Fields item={item} onChange={onChange} screenshot={screenshot} onScreenshot={(image) => onFile('image', image, 'screenshot')} />
      {item.section === 'project' && <Checklist steps={item.checklist} onChange={(checklist) => onChange({ checklist })} onAllDone={onAllStepsDone} />}
      {item.section === 'cert' && <Proof item={item} onChange={onChange} onFile={onFile} />}
      {item.url && (
        <a className="primary" href={item.url} target="_blank" rel="noreferrer">
          <Icon name={item.section === 'video' ? 'play' : 'link'} />
          {item.section === 'video' ? 'Open in YouTube' : item.section === 'cert' ? 'Open sign-up link' : 'Open link'}
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

// Proof is always on a certificate's sheet (owner's pick B), so it works as an achievements wallet for a CV.
function Proof({ item, onChange, onFile }: { item: Item; onChange: (patch: Partial<Item>) => void; onFile: (kind: FileKind, file: Blob, name: string) => void }) {
  const proof = useFileUrl(item.proof_at ? fileKey(item.id, 'proof') : null, item.proof_at)
  return (
    <section className="proof" aria-label="Proof">
      <h3><Icon name="cert" />Proof {item.status !== 'done' && <small>for when you finish</small>}</h3>
      <FilePick label="Certificate (PDF or image)" allowPdf onPick={(file, name) => onFile('proof', file, name)}
        current={<><Icon name="file" />{item.proof_name ? `${item.proof_name} (tap to replace)` : 'Add the certificate (PDF or image)'}</>} />
      {proof && <a className="ghost" href={proof} target="_blank" rel="noreferrer"><Icon name="file" />Open proof</a>}
      <LinkField id="f-credential" label="Credential link (optional)" value={item.credential_url} onChange={(credential_url) => onChange({ credential_url })} />
    </section>
  )
}
