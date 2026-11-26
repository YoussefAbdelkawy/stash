import { useEffect, useState } from 'react'
import { getFile } from './files'

// A saved screenshot or proof as a temporary link the page can show. `at` changes when the file is replaced.
export function useFileUrl(key: string | null, at?: string | null) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!key) return
    let link: string | null = null
    let current = true
    getFile(key).then((blob) => {
      if (!blob || !current) return
      link = URL.createObjectURL(blob)
      setUrl(link)
    })
    return () => { current = false; if (link) URL.revokeObjectURL(link); setUrl(null) }
  }, [key, at])
  return url
}
