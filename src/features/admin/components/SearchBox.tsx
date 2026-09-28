import { useState, type FormEvent } from 'react'
import { Search } from 'lucide-react'

interface SearchBoxProps {
  initialValue?: string
  placeholder: string
  label: string
  onSearch: (value: string | undefined) => void
}

// Searches when Enter is pressed, not on every key.
export function SearchBox({ initialValue = '', placeholder, label, onSearch }: SearchBoxProps) {
  const [text, setText] = useState(initialValue)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSearch(text.trim() || undefined)
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="flex items-center rounded-lg border border-border bg-white px-2">
      <Search className="h-4 w-4 text-muted" aria-hidden />
      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        maxLength={100}
        className="w-52 bg-transparent px-2 py-1.5 text-sm outline-none sm:w-60"
      />
    </form>
  )
}