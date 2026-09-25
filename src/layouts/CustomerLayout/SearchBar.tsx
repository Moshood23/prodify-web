import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'

export function SearchBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const currentQuery = location.pathname === '/search' ? (searchParams.get('q') ?? '') : ''
  const [query, setQuery] = useState(currentQuery)

  // Keep the box in sync when the URL changes (back button, "Clear all filters", leaving the search page).
  const [syncedQuery, setSyncedQuery] = useState(currentQuery)
  if (currentQuery !== syncedQuery) {
    setSyncedQuery(currentQuery)
    setQuery(currentQuery)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const q = query.trim()
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="order-last flex w-full items-center rounded-lg bg-white p-1 md:order-none md:flex-1"
    >
      <Search className="ml-2 h-4 w-4 text-muted" aria-hidden />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        maxLength={100}
        placeholder="Search products, brands and categories"
        aria-label="Search products"
        className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-sm text-ink outline-none"
      />
      <button type="submit" className="rounded-md bg-accent px-4 py-1.5 text-sm font-semibold text-ink hover:bg-accent-dark">
        Search
      </button>
    </form>
  )
}