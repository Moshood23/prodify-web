import { Clock } from 'lucide-react'
import { useNow } from '../hooks'
import { formatCountdown } from '../flashSaleLabels'
import { parseApiDate } from '../../../lib/format'

interface CountdownProps {
  endsAt: string
  // Text before the time, e.g. "Ends in".
  label?: string
  className?: string
}

// "Ends in 02:13:45", ticking every second.
export function Countdown({ endsAt, label = 'Ends in', className = '' }: CountdownProps) {
  const now = useNow()
  const left = parseApiDate(endsAt).getTime() - now

  return (
    <span className={`inline-flex items-center gap-1 tabular-nums ${className}`}>
      <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {left > 0 ? (
        <>
          {label} <span className="font-semibold">{formatCountdown(left)}</span>
        </>
      ) : (
        'Ended'
      )}
    </span>
  )
}
