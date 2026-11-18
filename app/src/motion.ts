// Cinematic motion (owner's pick, prototype B). Web Animations API only, no library.
// Every helper does nothing when the phone asks to reduce motion.

const EASE_OUT = 'cubic-bezier(.16,1,.3,1)'
const EASE_IN = 'cubic-bezier(.7,0,.84,0)'
const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches

function play(el: Element | null, frames: Keyframe[], options: KeyframeAnimationOptions): Promise<void> {
  if (!el || still()) return Promise.resolve()
  return el.animate(frames, options).finished.then(() => undefined)
}

// Opening: title words rise, the Now card lifts in with a light sweep, rows cascade.
export function playOpening(screen: HTMLElement) {
  screen.querySelectorAll('.hello span').forEach((word, n) =>
    play(word, [{ opacity: 0, transform: 'translateY(70%)' }, { opacity: 1, transform: 'none' }],
      { duration: 600, delay: n * 120, easing: EASE_OUT, fill: 'backwards' }))
  screen.querySelectorAll('.date, .sub, .tabs, .actions').forEach((el) =>
    play(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 350, fill: 'backwards' }))
  const now = screen.querySelector('.now')
  riseIn(now, 250)
  play(now?.querySelector('.sweep') ?? null, [{ transform: 'translateX(-120%)' }, { transform: 'translateX(120%)' }],
    { duration: 900, delay: 800, easing: 'ease-in-out' })
  screen.querySelectorAll('.list .row').forEach((row, n) =>
    play(row, [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }],
      { duration: 500, delay: 650 + n * 70, easing: EASE_OUT, fill: 'backwards' }))
}

export function riseIn(el: Element | null, delay = 0) {
  return play(el, [{ opacity: 0, transform: 'translateY(40px) scale(.94)' }, { opacity: 1, transform: 'none' }],
    { duration: 650, delay, easing: EASE_OUT, fill: 'backwards' })
}

// A row flies into the tab it is moving to, so you can see where it went.
export function flyToTab(row: Element | null, tab: Element | null) {
  if (!row || !tab) return Promise.resolve()
  const a = row.getBoundingClientRect()
  const b = tab.getBoundingClientRect()
  const x = b.left + b.width / 2 - (a.left + a.width / 2)
  return play(row, [{ transform: 'none', opacity: 1 }, { transform: `translate(${x}px, ${b.top - a.top}px) scale(.2)`, opacity: 0 }],
    { duration: 450, easing: EASE_IN, fill: 'forwards' })
}

export function pop(el: Element | null) {
  return play(el, [{ transform: 'scale(1.8)' }, { transform: 'none' }], { duration: 400, easing: EASE_OUT })
}

export function toastIn(el: Element | null) {
  return play(el, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 200, easing: EASE_OUT })
}

// Finishing something: a Done stamp lands, sparks burst, the Now card lifts away.
export async function celebrateDone(screen: HTMLElement, card: Element | null) {
  if (still()) return
  const stamp = document.createElement('div')
  stamp.className = 'stamp'
  stamp.innerHTML = '<b>Done</b>'
  screen.append(stamp)
  const word = stamp.firstElementChild!
  await play(word, [{ opacity: 0, transform: 'scale(2.4) rotate(-14deg)' }, { opacity: 1, transform: 'scale(1) rotate(-8deg)' }],
    { duration: 280, easing: EASE_IN, fill: 'forwards' })
  const box = word.getBoundingClientRect()
  for (let n = 0; n < 18; n++) {
    const spark = document.createElement('i')
    spark.className = 'spark'
    spark.style.left = `${box.left + box.width / 2}px`
    spark.style.top = `${box.top + box.height / 2}px`
    spark.style.background = ['var(--accent)', 'var(--done)', 'var(--warn-fg)'][n % 3]
    stamp.append(spark)
    const angle = (n / 18) * Math.PI * 2
    const distance = 90 + Math.random() * 60
    play(spark, [{ transform: 'none', opacity: 1 }, { transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) rotate(${n * 40}deg)`, opacity: 0 }],
      { duration: 700, easing: EASE_OUT, fill: 'forwards' })
  }
  await play(card, [{ transform: 'none', opacity: 1 }, { transform: 'translateY(-30px) rotateX(35deg) scale(.9)', opacity: 0 }],
    { duration: 450, delay: 250, easing: EASE_IN, fill: 'forwards' })
  play(stamp, [{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).then(() => stamp.remove())
}

// Slot-machine Random pick: titles spin, slow down and land on the pick.
export async function spinReel(reel: HTMLElement | null, titles: string[], pick: string) {
  if (!reel || still()) return
  const spins = Array.from({ length: 14 }, (_, n) => titles[n % titles.length]).concat(pick)
  reel.replaceChildren(...spins.map((t) => Object.assign(document.createElement('span'), { textContent: t })))
  const lineHeight = 20
  const spin = reel.animate([{ transform: 'none' }, { transform: `translateY(-${(spins.length - 1) * lineHeight}px)` }],
    { duration: 1600, easing: 'cubic-bezier(.12,.8,.2,1)', fill: 'forwards' })
  await spin.finished
  await new Promise((r) => setTimeout(r, 1200))
  spin.cancel()
  reel.replaceChildren(Object.assign(document.createElement('span'), { textContent: 'Random pick' }))
}

export function highlight(row: Element | null) {
  row?.scrollIntoView({ block: 'center', behavior: still() ? 'auto' : 'smooth' })
  play(row, [{ background: 'var(--soft)', transform: 'scale(1.03)' }, { background: 'transparent', transform: 'none' }],
    { duration: 1200, easing: EASE_OUT })
}

// Tab switch: the old list slides out and the new one slides in (View Transitions, Chrome).
export function slideTabs(direction: 1 | -1, update: () => void) {
  if (still() || !document.startViewTransition) return update()
  document.documentElement.style.setProperty('--dir', String(direction))
  document.startViewTransition(update)
}
