import { createStore, entries, get, set, setMany } from 'idb-keyval'

// Screenshots and proofs live in their own IndexedDB store, keyed "<item id>/image" or "<item id>/proof".
// A separate database (not a second store in "stash") because idb-keyval opens one store per database.
const files = createStore('stash-files', 'files')

export type FileKind = 'image' | 'proof'
export const fileKey = (id: string, kind: FileKind) => `${id}/${kind}`
export const getFile = (key: string) => get<Blob>(key, files)
// Saving again under the same key replaces the old screenshot or proof. Nothing here ever deletes a file.
export const saveFile = (key: string, blob: Blob) => set(key, blob, files)
export const saveFiles = (list: [string, Blob][]) => setMany(list, files)
export const allFiles = () => entries<string, Blob>(files)

const MAX_INPUT = 20 * 1024 * 1024 // a phone photo is a few MB; anything bigger is a mistake
const MAX_PDF = 10 * 1024 * 1024
const MAX_SIDE = 1600 // long side in pixels after shrinking: sharp on a phone, ~100-300 KB

// Checks a picked file before anything is saved. Returns an error message, or null when it's fine.
export function checkFile(file: { type: string; size: number }, allowPdf: boolean): string | null {
  const isImage = file.type.startsWith('image/')
  const isPdf = file.type === 'application/pdf'
  if (!isImage && !(allowPdf && isPdf)) return allowPdf ? 'Pick an image or a PDF.' : 'Pick an image (a screenshot or photo).'
  if (isPdf && file.size > MAX_PDF) return 'That PDF is over 10 MB. Pick a smaller one.'
  if (file.size > MAX_INPUT) return 'That file is over 20 MB. Pick a smaller one.'
  return null
}

// New width and height that fit inside MAX_SIDE, keeping the shape. Never makes an image bigger.
export function fitWithin(width: number, height: number, max = MAX_SIDE) {
  const scale = Math.min(1, max / Math.max(width, height))
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

// Shrinks a picked image with the browser's own canvas (no library; see HANDOFF step 4 research). PDFs are kept as they are.
export async function shrink(file: Blob): Promise<Blob> {
  if (file.type === 'application/pdf') return file
  const bitmap = await createImageBitmap(file) // applies the photo's rotation (EXIF) by default
  const { width, height } = fitWithin(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  const small = await new Promise<Blob | null>((done) => canvas.toBlob(done, 'image/webp', 0.82))
  return small && small.size < file.size ? small : file // keep the original if shrinking didn't help
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((done, fail) => {
    const reader = new FileReader()
    reader.onload = () => done(reader.result as string)
    reader.onerror = () => fail(reader.error)
    reader.readAsDataURL(blob)
  })
}

export const dataUrlToBlob = async (url: string) => (await fetch(url)).blob()
