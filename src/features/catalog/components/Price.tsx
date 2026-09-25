import { discountPercent, formatNaira } from '../../../lib/format'

interface PriceProps {
  price: number
  compareAtPrice?: number | null
  size?: 'md' | 'lg'
}

export function Price({ price, compareAtPrice, size = 'md' }: PriceProps) {
  const discount = discountPercent(price, compareAtPrice)

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className={`font-bold text-ink ${size === 'lg' ? 'text-2xl' : 'text-base'}`}>{formatNaira(price)}</span>
      {discount !== null && (
        <>
          <span className={`text-muted line-through ${size === 'lg' ? 'text-base' : 'text-xs'}`}>
            {formatNaira(compareAtPrice!)}
          </span>
          <span className="rounded bg-accent-light px-1.5 py-0.5 text-xs font-semibold text-accent-dark">-{discount}%</span>
        </>
      )}
    </div>
  )
}