// Phone-size screen test for step 2 (Videos). Run: npm run build && npm run e2e
// Needs Playwright with Chromium (preinstalled in Claude Code cloud containers). YouTube is mocked, so no network is used.
const { chromium } = require('playwright')
const { spawn } = require('node:child_process')
const assert = require('node:assert/strict')
const path = require('node:path')

const PORT = 4179
const URL = `http://localhost:${PORT}/`
const SHOTS = process.env.SHOTS || path.join(__dirname, 'shots')
const PYTHON = 'https://youtu.be/rfscVS0vtbw?si=AbC123xyz'
const SHORT = 'https://m.youtube.com/shorts/aqz-KE-bpKQ'
const THUMB = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="480" height="360" fill="#3a6"/></svg>')

async function main() {
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { cwd: path.join(__dirname, '..'), stdio: 'ignore' })
  const browser = await chromium.launch()
  try {
    for (let n = 0; n < 50; n++) { try { await fetch(URL); break } catch { await new Promise((r) => setTimeout(r, 200)) } }
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark', permissions: ['clipboard-read', 'clipboard-write'] })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(String(e)))
    page.on('console', (m) => m.type() === 'error' && !/favicon|fonts\.|oembed/.test(m.text() + m.location().url) && errors.push(m.text()))

    // Mock YouTube: the Python video has a title; the Short's title lookup fails.
    await page.route('https://www.youtube.com/oembed**', (route) =>
      route.request().url().includes('rfscVS0vtbw')
        ? route.fulfill({ json: { title: 'Learn Python - Full Course for Beginners' } })
        : route.fulfill({ status: 404, body: 'Not Found' }))
    await page.route('https://img.youtube.com/**', (route) => route.fulfill({ body: THUMB, contentType: 'image/svg+xml' }))

    await page.goto(URL)
    await page.getByText('Nothing saved yet. Tap +').waitFor()

    // 1. Paste from clipboard → preview with title → save → row with thumbnail in To do.
    await page.getByRole('button', { name: 'Add a video' }).click()
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
    await page.getByRole('button', { name: 'Add a video' }).click()
    await page.getByLabel('YouTube link').fill(SHORT)
    await page.getByText('No title found').waitFor()
    await page.getByRole('button', { name: 'Save to To do' }).click()
    await page.locator('.row', { hasText: 'aqz-KE-bpKQ' }).getByText('Needs details').waitFor()

    // 3. A bad link explains itself and can't be saved.
    await page.getByRole('button', { name: 'Add a video' }).click()
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
    await page.getByRole('button', { name: 'Add a video' }).click()
    await page.getByLabel('YouTube link').fill(PYTHON)
    await page.getByText('Already saved').waitFor()
    await page.waitForTimeout(600)
    await page.screenshot({ path: `${SHOTS}/add-light.png` })

    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 390, 'no sideways scroll')
    assert.deepEqual(errors, [], 'no console errors')
    console.log('e2e: all 7 video checks passed')
  } finally {
    await browser.close()
    server.kill()
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
