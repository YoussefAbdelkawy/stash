import { describe, expect, it } from 'vitest'
import { checkFile, fitWithin } from './files'

const MB = 1024 * 1024

describe('files', () => {
  it('accepts images, and PDFs only where proof is allowed', () => {
    expect(checkFile({ type: 'image/jpeg', size: 3 * MB }, false)).toBeNull()
    expect(checkFile({ type: 'image/png', size: 1 }, true)).toBeNull()
    expect(checkFile({ type: 'application/pdf', size: MB }, true)).toBeNull()
    expect(checkFile({ type: 'application/pdf', size: MB }, false)).toMatch(/Pick an image/)
    expect(checkFile({ type: 'text/plain', size: 1 }, true)).toMatch(/image or a PDF/)
    expect(checkFile({ type: '', size: 1 }, false)).toMatch(/Pick an image/)
  })

  it('rejects files that are too big', () => {
    expect(checkFile({ type: 'application/pdf', size: 11 * MB }, true)).toMatch(/10 MB/)
    expect(checkFile({ type: 'image/jpeg', size: 21 * MB }, false)).toMatch(/20 MB/)
  })

  it('fits big images inside 1600 px and never enlarges small ones', () => {
    expect(fitWithin(4000, 3000)).toEqual({ width: 1600, height: 1200 })
    expect(fitWithin(1080, 2400)).toEqual({ width: 720, height: 1600 })
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 })
  })
})
