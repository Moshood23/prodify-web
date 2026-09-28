import { useSearchParams } from 'react-router-dom'

// List pages keep their filters in the address bar, so Back and shared links keep them.
export function useUrlFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  function update(changes: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    // Any filter change starts again from page 1.
    if (!('page' in changes)) next.delete('page')
    setSearchParams(next)
  }

  return {
    get: (key: string) => searchParams.get(key) ?? undefined,
    page: Math.max(1, Number(searchParams.get('page')) || 1),
    update,
  }
}