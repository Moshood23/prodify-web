// "12 left" with a bar filling up as the sale units go.
export function SoldBar({ sold, quantity, className = '' }: { sold: number; quantity: number; className?: string }) {
  const left = Math.max(0, quantity - sold)
  const percent = quantity > 0 ? Math.min(100, Math.round((sold / quantity) * 100)) : 100

  return (
    <div className={className}>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-accent-light"
        role="progressbar"
        aria-label="Flash sale units sold"
        aria-valuemin={0}
        aria-valuemax={quantity}
        aria-valuenow={sold}
      >
        <div className="h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-1 text-xs text-muted">{left > 0 ? `${left} left` : 'Sold out'}</p>
    </div>
  )
}
