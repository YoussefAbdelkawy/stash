// Phone-size screen tests: step 2 (Videos), step 3 (Share) and step 4 (the other sections). Run: npm run build && npm run e2e
// Needs Playwright with Chromium (preinstalled in Claude Code cloud containers). YouTube is mocked, so no network is used.
const { chromium } = require('playwright')
const { spawn } = require('node:child_process')
const fs = require('node:fs')
const assert = require('node:assert/strict')
const path = require('node:path')

const PORT = 4179
const URL = `http://localhost:${PORT}/stash/`
const SHOTS = process.env.SHOTS || path.join(__dirname, 'shots')
const PYTHON = 'https://youtu.be/rfscVS0vtbw?si=AbC123xyz'
const SHORT = 'https://m.youtube.com/shorts/aqz-KE-bpKQ'
const THUMB = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="480" height="360" fill="#3a6"/></svg>')

async function main() {
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { cwd: path.join(__dirname, '..'), stdio: 'ignore' })
  const browser = await chromium.launch()
  try {
    for (let n = 0; n < 50; n++) { try { await fetch(URL); break } catch { await new Promise((r) => setTimeout(r, 200)) } }
    const errors = []
    // A fresh phone each time (own storage). The service worker is blocked here so the YouTube mocks apply; it's checked on its own in 12.
    async function phone(options = {}) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark', serviceWorkers: 'block', ...options })
      const page = await context.newPage()
      page.on('pageerror', (e) => errors.push(String(e)))
      page.on('console', (m) => m.type() === 'error' && !/favicon|fonts\.|oembed/.test(m.text() + m.location().url) && errors.push(m.text()))
      // Mock YouTube: the Python video has a title; other title lookups fail.
      await page.route('https://www.youtube.com/oembed**', (route) =>
        route.request().url().includes('rfscVS0vtbw')
          ? route.fulfill({ json: { title: 'Learn Python - Full Course for Beginners' } })
          : route.fulfill({ status: 404, body: 'Not Found' }))
      await page.route('https://img.youtube.com/**', (route) => route.fulfill({ body: THUMB, contentType: 'image/svg+xml' }))
      return page
    }
    const page = await phone({ permissions: ['clipboard-read', 'clipboard-write'] })
    // + opens the section tiles first (owner's pick A); the Video tile opens the video page.
    const addVideo = async (p = page) => { await p.getByRole('button', { name: 'Add to Stash' }).click(); await p.getByRole('button', { name: /^Video/ }).click() }
    const addSection = async (name, p = page) => { await p.getByRole('button', { name: 'Add to Stash' }).click(); await p.getByRole('button', { name: new RegExp(`^${name}`) }).click() }

    await page.goto(URL)
    await page.getByText('Nothing saved yet. Tap +').waitFor()

    // 1. Paste from clipboard → preview with title → save → row with thumbnail in To do.
    await addVideo()
    await page.evaluate((t) => navigator.clipboard.writeText(t), PYTHON)
    await page.getByRole('button', { name: /Paste from clipboard/ }).click()
    await page.locator('.preview strong', { hasText: 'Learn Python' }).waitFor()
    await page.waitForTimeout(600)
    await page.screenshot({ path: `${SHOTS}/add-dark.png` })
    await page.getByRole('button', { name: 'Save to To do' }).click()
    const python = page.locator('.row', { hasText: 'Learn Python' })
    await python.waitFor()
    await page.getByText('Saved to To do: Learn Python').waitFor()
    assert.equal(await page.locator('[data-tab="todo"]').getAttribute('aria-pressed'), 'true', 'switches to To do')
    assert.ok(await python.locator('img').evaluate((img) => img.complete && img.naturalWidth > 0), 'thumbnail loads')

    // 2. Title lookup fails → still saves, as a Draft with "Needs details".
    await addVideo()
    await page.getByLabel('YouTube link').fill(SHORT)
    await page.getByText('No title found').waitFor()
    await page.getByRole('button', { name: 'Save to To do' }).click()
    await page.locator('.row', { hasText: 'aqz-KE-bpKQ' }).getByText('Needs details').waitFor()

    // 3. A bad link explains itself and can't be saved.
    await addVideo()
    await page.getByLabel('YouTube link').fill('https://vimeo.com/123')
    await page.getByText("doesn't look like a YouTube link").waitFor()
    assert.ok(await page.getByRole('button', { name: 'Save to To do' }).isDisabled())

    // 4. The same video again → "Already saved" → Open it → the detail sheet.
    await page.getByLabel('YouTube link').fill('https://www.youtube.com/watch?v=rfscVS0vtbw&t=42s')
    await page.getByText('Already saved').waitFor()
    assert.ok(await page.getByRole('button', { name: 'Save to To do' }).isDisabled())
    await page.getByRole('button', { name: 'Open it' }).click()
    const sheet = page.locator('dialog.sheet')
    await sheet.getByRole('link', { name: 'Open in YouTube' }).waitFor()
    assert.equal(await sheet.getByRole('link', { name: 'Open in YouTube' }).getAttribute('href'), PYTHON)
    await page.waitForTimeout(600)
    await page.screenshot({ path: `${SHOTS}/details-dark.png` })

    // 5. Rename in the sheet, then Doing → it becomes the Now card.
    await sheet.getByLabel('Title').fill('Python course')
    await sheet.getByRole('button', { name: 'Doing' }).click()
    await page.locator('.now h2', { hasText: 'Python course' }).waitFor()

    // 6. Fill in the draft's title via its row → "Needs details" goes away.
    await page.locator('.row', { hasText: 'aqz-KE-bpKQ' }).click()
    await sheet.getByLabel('Title').fill('Big Buck Bunny short')
    await sheet.locator('.two').getByRole('button', { name: 'Done' }).click()
    await page.locator('dialog.sheet').waitFor({ state: 'detached' })
    assert.equal(await page.locator('.row', { hasText: 'Big Buck Bunny short' }).getByText('Needs details').count(), 0)

    // 7. Archive hides it; reloading keeps everything (IndexedDB) and the archived item stays hidden.
    await page.locator('.row', { hasText: 'Big Buck Bunny short' }).click()
    await sheet.getByRole('button', { name: 'Archive' }).click()
    await page.getByText('Archived: Big Buck Bunny short').waitFor()
    await page.reload()
    await page.locator('.now h2', { hasText: 'Python course' }).waitFor()
    await page.waitForTimeout(1500)
    assert.equal(await page.getByText('Big Buck Bunny short').count(), 0, 'archived stays hidden')
    await page.screenshot({ path: `${SHOTS}/home-dark.png` })

    await page.emulateMedia({ colorScheme: 'light' })
    await page.screenshot({ path: `${SHOTS}/home-light.png` })
    await addVideo()
    await page.getByLabel('YouTube link').fill(PYTHON)
    await page.getByText('Already saved').waitFor()
    await page.waitForTimeout(600)
    await page.screenshot({ path: `${SHOTS}/add-light.png` })

    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 390, 'no sideways scroll')

    // 8. Share from the YouTube app (Android puts "title + link" in text) → saved at once, with the looked-up title.
    const share = await phone()
    const shareUrl = (q) => `${URL}?${new URLSearchParams(q)}`
    await share.goto(shareUrl({ title: '', text: 'Learn Python - Full Course https://youtu.be/rfscVS0vtbw?si=x', url: '' }))
    await share.getByText('Saved to To do: Learn Python').waitFor()
    await share.locator('.row', { hasText: 'Learn Python' }).waitFor()
    assert.equal(new globalThis.URL(share.url()).search, '', 'share data is cleared from the address')
    await share.waitForTimeout(400)
    await share.screenshot({ path: `${SHOTS}/share-dark.png` })

    // 9. Share a course page from Chrome → Course draft that keeps the page title.
    await share.goto(shareUrl({ title: 'CS50x - Harvard', text: '', url: 'https://cs50.harvard.edu/x/' }))
    await share.getByText('Saved as a Draft').waitFor()
    await share.locator('.row', { hasText: 'CS50x - Harvard' }).getByText('Needs details').waitFor()

    // 10. The same video again → "Already saved" and its sheet opens. A share with no link saves nothing.
    await share.goto(shareUrl({ text: 'https://www.youtube.com/watch?v=rfscVS0vtbw' }))
    await share.getByText('Already saved: Learn Python').waitFor()
    await share.locator('dialog.sheet').getByRole('link', { name: 'Open in YouTube' }).waitFor()
    await share.goto(shareUrl({ text: 'just a note' }))
    await share.getByText('that share had no link').waitFor()

    // 11. Reloading never saves a share twice.
    await share.reload()
    await share.waitForTimeout(1500)
    await share.getByText('0 in progress, 2 waiting').waitFor() // exactly the two shared items

    // 13. A course: name + link + tags → saved, with its site under the title.
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.keyboard.press('Escape') // close the Add page step 7 left open (Back on the phone)
    await page.locator('dialog.page').waitFor({ state: 'detached' })
    await addSection('Course')
    await page.getByRole('heading', { name: 'New course' }).waitFor()
    assert.equal((await page.getByRole('button', { name: 'Save as Draft' }).count()), 1, 'empty form says Save as Draft')
    await page.getByLabel('Course name').fill('The Odin Project')
    await page.getByLabel('Link', { exact: true }).fill('not a link')
    await page.getByText("doesn't look like a link").waitFor()
    await page.getByLabel('Link', { exact: true }).fill('https://www.theodinproject.com/paths')
    await page.getByLabel(/Topic tags/).fill('javascript, web, JavaScript')
    await page.waitForTimeout(300)
    await page.screenshot({ path: `${SHOTS}/add-course-dark.png` })
    await page.getByRole('button', { name: 'Save to To do' }).click()
    await page.locator('.row', { hasText: 'The Odin Project' }).getByText('Course, theodinproject.com').waitFor()

    // 14. A book with no name → still saves, as a Draft with "Needs details".
    await addSection('Book')
    await page.getByLabel(/Author/).fill('James Clear')
    await page.getByText('Missing a name').waitFor()
    await page.getByRole('button', { name: 'Save as Draft' }).click()
    await page.locator('.row', { hasText: 'Book, James Clear' }).getByText('Needs details').waitFor()

    // 15. A certificate with a big screenshot → shrunk and shown as its cover; Paid + price under the title.
    const big = path.join(SHOTS, 'big-screenshot.png')
    const png = await page.evaluate(() => {
      const c = Object.assign(document.createElement('canvas'), { width: 3000, height: 2000 })
      const g = c.getContext('2d')
      for (let n = 0; n < 4000; n++) { g.fillStyle = `hsl(${n % 360} 70% 50%)`; g.fillRect(Math.random() * 3000, Math.random() * 2000, 60, 60) }
      return c.toDataURL('image/png').split(',')[1]
    })
    fs.writeFileSync(big, Buffer.from(png, 'base64'))
    await addSection('Certificate')
    await page.getByLabel('Certificate name').fill('Google Data Analytics')
    await page.getByLabel('Provider').fill('Coursera')
    await page.getByRole('button', { name: 'Paid' }).click()
    await page.getByLabel('Price').fill('$49 a month')
    await page.locator('input[type=file][aria-label="Screenshot (optional)"]').setInputFiles({ name: 'note.txt', mimeType: 'text/plain', buffer: Buffer.from('hi') })
    await page.getByText('Pick an image (a screenshot or photo).').waitFor()
    await page.locator('input[type=file][aria-label="Screenshot (optional)"]').setInputFiles(big)
    await page.getByText('Change screenshot').waitFor()
    await page.waitForTimeout(300)
    await page.screenshot({ path: `${SHOTS}/add-cert-dark.png` })
    await page.getByRole('button', { name: 'Save to To do' }).click()
    const certRow = page.locator('.row', { hasText: 'Google Data Analytics' })
    await certRow.getByText('Certificate, Coursera, $49 a month').waitFor()
    await certRow.locator('img').waitFor()
    const shot = await page.evaluate(() => new Promise((done) => {
      const open = indexedDB.open('stash-files')
      open.onsuccess = () => {
        const all = open.result.transaction('files').objectStore('files').getAll()
        all.onsuccess = async () => done(await Promise.all(all.result.map(async (b) => { const i = await createImageBitmap(b); return { type: b.type, size: b.size, width: i.width, height: i.height } })))
      }
    }))
    assert.equal(shot.length, 1)
    assert.deepEqual([shot[0].type, shot[0].width, shot[0].height], ['image/webp', 1600, 1067], 'screenshot shrunk to fit 1600 px')
    assert.ok(shot[0].size < fs.statSync(big).size, `smaller than the original (${shot[0].size} bytes)`)

    // 16. Proof is always on a certificate's sheet (owner's pick B): add a PDF and a credential link.
    await certRow.click()
    const sheet2 = page.locator('dialog.sheet')
    await sheet2.getByText('for when you finish').waitFor()
    await sheet2.locator('input[type=file][aria-label="Certificate (PDF or image)"]').setInputFiles({ name: 'certificate.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 test') })
    await page.getByText('Proof saved.').waitFor()
    await sheet2.getByRole('link', { name: 'Open proof' }).waitFor()
    await sheet2.getByLabel(/Credential link/).fill('https://coursera.org/verify/ABC123')
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${SHOTS}/cert-sheet-dark.png` })
    await sheet2.locator('.two').getByRole('button', { name: 'Done' }).click()
    await sheet2.waitFor({ state: 'detached' })

    // 17. A project: after saving, its sheet opens; add steps → no longer a Draft; tick, then reorder in Edit mode.
    await addSection('Project')
    await page.getByLabel('Project name').fill('Budget tracker app')
    await page.getByRole('button', { name: /M · 1–2 weeks/ }).click()
    await page.getByRole('button', { name: 'Mid' }).click()
    await page.getByRole('button', { name: 'Save as Draft' }).click()
    const sheet3 = page.locator('dialog.sheet')
    await sheet3.getByText('Until it has one, it stays a Draft').waitFor()
    for (const step of ['Sketch the screens', 'Add income and expenses', 'Monthly chart']) {
      await sheet3.getByLabel('New step').fill(step)
      await sheet3.getByLabel('New step').press('Enter')
    }
    await sheet3.getByText('0/3 done').waitFor()
    await sheet3.getByRole('button', { name: 'Done editing' }).click()
    await sheet3.getByRole('checkbox', { name: 'Sketch the screens' }).click()
    await sheet3.getByText('1/3 done').waitFor()
    await sheet3.getByRole('button', { name: 'Edit steps' }).click()
    await sheet3.getByRole('button', { name: 'Move "Monthly chart" up' }).click()
    await sheet3.getByRole('button', { name: 'Done editing' }).click()
    assert.deepEqual(await sheet3.locator('.step span').allTextContents(), ['Sketch the screens', 'Monthly chart', 'Add income and expenses'])
    await page.waitForTimeout(400)
    await page.screenshot({ path: `${SHOTS}/project-sheet-dark.png` })
    await sheet3.getByRole('button', { name: 'Doing' }).click()
    await page.locator('.now h2', { hasText: 'Budget tracker app' }).waitFor()
    await page.locator('.now').getByText('1/3 steps done').waitFor()

    // 18. Section chips on every sheet: the course becomes a book; its fields change, the name stays.
    await page.locator('[data-tab="todo"]').click()
    await page.locator('.row', { hasText: 'The Odin Project' }).click()
    const sheet4 = page.locator('dialog.sheet')
    await sheet4.getByRole('button', { name: 'Book' }).click()
    await sheet4.getByLabel(/Author/).waitFor()
    assert.equal(await sheet4.getByLabel('Book name').inputValue(), 'The Odin Project')
    await sheet4.locator('.two').getByRole('button', { name: 'Done' }).click()
    await page.locator('.row', { hasText: 'The Odin Project' }).getByText(/^Book$/).waitFor()

    // 19. Backup → archive one → restore on a fresh phone: items, archived items and the screenshot come back.
    await page.locator('.row', { hasText: 'Book, James Clear' }).click()
    await page.locator('dialog.sheet').getByRole('button', { name: 'Archive' }).click()
    await page.getByText(/^Archived:/).waitFor()
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download backup' }).click()])
    const backupFile = path.join(SHOTS, 'backup.json')
    await download.saveAs(backupFile)
    const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'))
    assert.equal(backup.version, 2)
    assert.ok(backup.items.some((i) => i.archived_at), 'archived items are in the backup')
    assert.equal(Object.keys(backup.files).length, 2, 'screenshot and proof are in the backup')
    const fresh = await phone()
    await fresh.goto(URL)
    await fresh.getByText('Nothing saved yet').waitFor()
    await fresh.locator('input[type=file][aria-label="Choose a backup file"]').setInputFiles(backupFile)
    await fresh.getByText('Backup restored').waitFor()
    await fresh.locator('[data-tab="todo"]').click()
    await fresh.locator('.row', { hasText: 'Google Data Analytics' }).locator('img').waitFor()
    assert.equal(await fresh.getByText('James Clear').count(), 0, 'archived stays hidden after restore')
    // An old (version 1) backup still restores.
    const v1 = path.join(SHOTS, 'backup-v1.json')
    fs.writeFileSync(v1, JSON.stringify({ app: 'stash', version: 1, items: [{ id: 'old1', section: 'book', status: 'todo', is_draft: false, title: 'Deep Work', url: null, checklist: [], created_at: '2026-11-01T00:00:00Z' }] }))
    await fresh.locator('input[type=file][aria-label="Choose a backup file"]').setInputFiles(v1)
    await fresh.locator('.row', { hasText: 'Deep Work' }).waitFor()
    assert.equal(await fresh.evaluate(() => document.documentElement.scrollWidth), 390, 'no sideways scroll')
    await fresh.waitForTimeout(400)
    await fresh.screenshot({ path: `${SHOTS}/restored-dark.png` })
    await fresh.emulateMedia({ colorScheme: 'light' })
    await fresh.screenshot({ path: `${SHOTS}/restored-light.png` })
    await page.emulateMedia({ colorScheme: 'light' })
    await addSection('Certificate')
    await page.waitForTimeout(300)
    await page.screenshot({ path: `${SHOTS}/add-cert-light.png` })
    await page.getByRole('button', { name: 'Back to sections' }).click()
    await page.waitForTimeout(300)
    await page.screenshot({ path: `${SHOTS}/tiles-light.png` })

    // 12. Install pieces: the service worker runs, the manifest has the share target, and the icons load.
    const real = await (await browser.newContext()).newPage()
    await real.goto(URL)
    const install = await real.evaluate(async () => {
      await navigator.serviceWorker.ready
      const manifest = await (await fetch(document.querySelector('link[rel=manifest]').href)).json()
      const icons = await Promise.all(manifest.icons.map((i) => fetch(new URL(i.src, document.querySelector('link[rel=manifest]').href)).then((r) => r.status)))
      return { manifest, icons }
    })
    assert.equal(install.manifest.name, 'Stash')
    assert.equal(install.manifest.display, 'standalone')
    assert.deepEqual(install.manifest.share_target, { action: './', method: 'GET', params: { title: 'title', text: 'text', url: 'url' } })
    assert.deepEqual(install.icons, [200, 200, 200, 200])

    assert.deepEqual(errors, [], 'no console errors')
    console.log('e2e: all 19 checks passed (videos, share, sections)')
  } finally {
    await browser.close()
    server.kill()
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
