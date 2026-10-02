import { useState } from 'react'
import { Star } from 'lucide-react'

const labels = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent']

// Five tappable stars for choosing a rating, with arrow-key support.
export function StarPicker({ value, onChange, error }: { value: number; onChange: (value: number) => void; error?: string }) {
  const [hover, setHover] = useState(0)
  const shown = hover || value

  return (
    <div>
      <div role="radiogroup" aria-label="Your rating" className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((stars) => (
          <button
            key={stars}
            type="button"
            role="radio"
            aria-checked={value === stars}
            aria-label={`${stars} star${stars === 1 ? '' : 's'}, ${labels[stars]}`}
            onClick={() => onChange(stars)}
            onMouseEnter={() => setHover(stars)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onChange(Math.min(5, (value || 0) + 1))
              if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onChange(Math.max(1, (value || 2) - 1))
            }}
            className="rounded p-0.5 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <Star className={`h-8 w-8 ${stars <= shown ? 'text-accent' : 'text-border'}`} fill="currentColor" aria-hidden />
          </button>
        ))}
        <span className="ml-2 text-sm font-medium text-muted">{labels[shown]}</span>
      </div>
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  )
}
