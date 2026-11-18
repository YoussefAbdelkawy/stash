import { createStore, set, setMany, values } from 'idb-keyval'
import type { Item } from './items'

// Everything lives in this phone's browser storage (IndexedDB). Nothing leaves the device.
const items = createStore('stash', 'items')

export async function loadItems(): Promise<Item[]> {
  const all = await values<Item>(items)
  return all.filter((i) => !i.archived_at).sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export const saveItem = (item: Item) => set(item.id, item, items)

// Restore adds or overwrites by id; it never removes items you already have.
export const saveItems = (list: Item[]) => setMany(list.map((i) => [i.id, i]), items)

// Ask Chrome not to clear our storage when the phone runs low on space.
export const askToKeepData = () => navigator.storage?.persist?.()
