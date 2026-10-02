import { Stars } from './Stars'

// Stars, "4.5" and "(12)" under a product name. Nothing when there are no reviews yet.
export function RatingBadge({ rating, count }: { rating: number | null; count: number }) {
  if (rating === null || count === 0) return null

  return (
    <span className="flex items-center gap-1 text-xs text-muted">
      <Stars value={rating} size="sm" />
      <span className="font-semibold text-ink">{rating.toFixed(1)}</span>
      <span>({count})</span>
    </span>
  )
}
