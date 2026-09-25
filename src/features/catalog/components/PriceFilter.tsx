import type { FormEvent } from 'react'

interface PriceFilterProps {
  minPrice?: number
  maxPrice?: number
  onApply: (minPrice?: number, maxPrice?: number) => void
}

function toNumber(value: FormDataEntryValue | null): number | undefined {
  const n = Number(value)
  return value === null || value === '' || Number.isNaN(n) || n < 0 ? undefined : n
}

export function PriceFilter({ minPrice, maxPrice, onApply }: PriceFilterProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    let min = toNumber(form.get('minPrice'))
    let max = toNumber(form.get('maxPrice'))

    // Swapped by mistake? Put them the right way round instead of showing an error.
    if (min !== undefined && max !== undefined && min > max) [min, max] = [max, min]

    onApply(min, max)
  }

  const inputClass =
    'w-full min-w-0 rounded-lg border border-border bg-white px-2 py-1.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-light'

  return (
    // The key resets the inputs when the URL changes (e.g. "Clear filters").
    <form key={`${minPrice}-${maxPrice}`} onSubmit={handleSubmit} className="space-y-2">
      <div className="flex items-center gap-2">
        <input name="minPrice" type="number" min={0} inputMode="numeric" placeholder="Min ₦" defaultValue={minPrice} aria-label="Minimum price" className={inputClass} />
        <span className="text-muted">–</span>
        <input name="maxPrice" type="number" min={0} inputMode="numeric" placeholder="Max ₦" defaultValue={maxPrice} aria-label="Maximum price" className={inputClass} />
      </div>
      <button type="submit" className="w-full rounded-lg border border-primary py-1.5 text-sm font-semibold text-primary hover:bg-primary-light">
        Apply
      </button>
    </form>
  )
}