import { Minus, Plus } from 'lucide-react'

interface QuantityPickerProps {
  value: number
  max: number
  onChange: (value: number) => void
  disabled?: boolean
}

export function QuantityPicker({ value, max, onChange, disabled }: QuantityPickerProps) {
  const buttonClass = 'flex h-10 w-10 items-center justify-center text-ink hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-white">
      <button type="button" className={buttonClass} disabled={disabled || value <= 1} onClick={() => onChange(value - 1)} aria-label="Decrease quantity">
        <Minus className="h-4 w-4" aria-hidden />
      </button>
      <span className="w-10 text-center text-sm font-semibold" aria-live="polite" aria-label={`Quantity ${value}`}>
        {value}
      </span>
      <button type="button" className={buttonClass} disabled={disabled || value >= max} onClick={() => onChange(value + 1)} aria-label="Increase quantity">
        <Plus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  )
}