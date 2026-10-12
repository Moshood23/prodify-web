import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ProductImage } from '../../catalog/components/ProductImage'
import { formatDateTime, formatNaira } from '../../../lib/format'
import { percentOff } from '../flashSaleLabels'
import type { FlashSale } from '../../../types/flashSale'
import { FlashSaleStateBadge } from './FlashSaleStateBadge'
import { SoldBar } from './SoldBar'

interface FlashSaleListItemProps {
  sale: FlashSale
  // The store's name, shown to admins.
  showSeller?: boolean
  actions?: ReactNode
}

// One flash sale in the seller's and the admin's lists.
export function FlashSaleListItem({ sale, showSeller = false, actions }: FlashSaleListItemProps) {
  const name = sale.variantName ? `${sale.productName} (${sale.variantName})` : sale.productName
  const priceChanged = sale.currentPrice !== sale.regularPrice

  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row">
      <Link to={`/products/${sale.productId}`} className="shrink-0">
        <ProductImage src={sale.imageUrl} alt={sale.productName} className="h-16 w-16 rounded-lg" />
      </Link>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold">{name}</p>
          <FlashSaleStateBadge state={sale.state} />
        </div>
        {showSeller && <p className="text-sm text-muted">{sale.sellerName}</p>}

        <p className="text-sm">
          <span className="font-bold">{formatNaira(sale.salePrice)}</span>{' '}
          <span className="text-muted line-through">{formatNaira(sale.regularPrice)}</span>{' '}
          <span className="font-semibold text-accent-dark">-{percentOff(sale.salePrice, sale.regularPrice)}%</span>
          {priceChanged && <span className="text-muted">, price now {formatNaira(sale.currentPrice)}</span>}
        </p>

        <p className="text-sm text-muted">
          {formatDateTime(sale.startsAt)} to {formatDateTime(sale.endsAt)}, {sale.quantity} units, at most {sale.maxPerCustomer} per
          customer
        </p>

        {sale.status === 'Approved' && <SoldBar sold={sale.sold} quantity={sale.quantity} className="max-w-xs" />}

        {sale.reviewNote && (
          <p className="rounded-md bg-surface px-3 py-2 text-sm">
            <span className="font-semibold">Prodify:</span> {sale.reviewNote}
          </p>
        )}

        {actions}
      </div>
    </li>
  )
}
