import { useState } from 'react'
import { addStep, moveStep, removeStep, renameStep, toggleStep, type Step } from './items'
import { Icon } from './Icon'

// A project's goal checklist (owner's pick B): tick steps here; "Edit steps" switches to rename, reorder and remove.
export function Checklist({ steps, onChange, onAllDone }: { steps: Step[]; onChange: (steps: Step[]) => void; onAllDone: () => void }) {
  const [editing, setEditing] = useState(steps.length === 0) // a new project starts in Edit mode, so several steps can be added in a row
  const [text, setText] = useState('')
  const done = steps.filter((s) => s.done).length

  function tick(n: number) {
    const next = toggleStep(steps, n)
    onChange(next)
    if (next.every((s) => s.done) && done < steps.length) onAllDone()
  }

  return (
    <section className="checklist" aria-label="Goal checklist">
      <div className="prog"><span>Goal checklist</span>{steps.length > 0 && <span>{done}/{steps.length} done</span>}</div>
      {steps.length > 0 && (
        <>
          <div className="stepbar"><i style={{ transform: `scaleX(${done / steps.length})` }} /></div>
          <button type="button" className="ghost small" onClick={() => setEditing(!editing)}>
            <Icon name={editing ? 'check' : 'edit'} />{editing ? 'Done editing' : 'Edit steps'}
          </button>
        </>
      )}
      <div className="steps">
        {steps.map((s, n) => editing ? (
          <div className="step" key={n}>
            <span className="arrows"><button type="button" onClick={() => onChange(moveStep(steps, n, -1))} aria-label={`Move "${s.text}" up`} disabled={n === 0}><Icon name="up" /></button></span>
            <input value={s.text} aria-label={`Step ${n + 1}`} maxLength={200} onChange={(e) => onChange(renameStep(steps, n, e.target.value))} />
            <span className="arrows">
              <button type="button" onClick={() => onChange(moveStep(steps, n, 1))} aria-label={`Move "${s.text}" down`} disabled={n === steps.length - 1}><Icon name="down" /></button>
              <button type="button" onClick={() => onChange(removeStep(steps, n))} aria-label={`Remove "${s.text}"`}><Icon name="x" /></button>
            </span>
          </div>
        ) : (
          <div className="step" key={n} data-done={s.done}>
            <button type="button" className="box" role="checkbox" aria-checked={s.done} aria-label={s.text} onClick={() => tick(n)}>{s.done && <Icon name="check" />}</button>
            <span>{s.text}</span>
          </div>
        ))}
      </div>
      {(editing || steps.length === 0) && (
        <form className="addstep" onSubmit={(e) => { e.preventDefault(); onChange(addStep(steps, text)); setText('') }}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a step" aria-label="New step" maxLength={200} />
          <button type="submit">Add</button>
        </form>
      )}
      {steps.length === 0 && <p className="hint">Add the steps that finish this project. Until it has one, it stays a Draft.</p>}
    </section>
  )
}
