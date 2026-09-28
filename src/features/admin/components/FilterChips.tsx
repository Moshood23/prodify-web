interface FilterChipsProps<T extends string> {
  label: string
  options: { value?: T; label: string; count?: number }[]
  value: T | undefined
  onChange: (value: T | undefined) => void
}

// A row of pill buttons, e.g. "All · In progress · Delivered".
export function FilterChips<T extends string>({ label, options, value, onChange }: FilterChipsProps<T>) {
  return (
    <nav aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.label}
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
              active ? 'border-primary bg-primary text-white' : 'border-border bg-white hover:border-primary'
            }`}
          >
            {option.label}
            {option.count !== undefined && <span className={`ml-1.5 ${active ? 'text-primary-light' : 'text-muted'}`}>{option.count}</span>}
          </button>
        )
      })}
    </nav>
  )
}