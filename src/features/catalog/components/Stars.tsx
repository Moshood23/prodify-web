import { Star } from 'lucide-react'

interface StarsProps {
  // 0 to 5; parts of a star are filled in (4.5 shows four and a half stars).
  value: number
  size?: 'sm' | 'md' | 'lg'
}

const sizes = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' }

// Five stars, filled in amber up to the rating. Screen readers hear "4.5 out of 5 stars".
export function Stars({ value, size = 'md' }: StarsProps) {
  const percent = Math.max(0, Math.min(5, value)) * 20
  const icon = `${sizes[size]} shrink-0`

  return (
    <span className="relative inline-flex" role="img" aria-label={`${value} out of 5 stars`}>
      <span className="flex text-border">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={icon} fill="currentColor" aria-hidden />
        ))}
      </span>
      <span className="absolute inset-y-0 left-0 flex overflow-hidden text-accent" style={{ width: `${percent}%` }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={icon} fill="currentColor" aria-hidden />
        ))}
      </span>
    </span>
  )
}
