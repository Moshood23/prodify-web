import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { useAddToCart } from '../../cart/hooks/useCart'
import { ProductImage } from '../../catalog/components/ProductImage'
import { Price } from '../../catalog/components/Price'
import { formatDateTime } from '../../../lib/format'
import type { Deal } from '../../../types/flashSale'
import { Countdown } from './Countdown'
import { SoldBar } from './SoldBar'

// One flash sale: on the deals page and in the home page strip.
export function DealCard({ deal, upcoming = false }: { deal: Deal; upcoming?: boolean }) {
  const { addToCart, addingVariantId } = useAddToCart()
  const productUrl = `/products/${deal.productId}`
  const name = deal.variantName ? `${deal.productName} (${deal.variantName})` : deal.productName

  return (
    <article className="flex flex-col rounded-xl border border-border bg-white p-3 transition-shadow hover:shadow-md">
      <Link to={productUrl} className="relative mb-3 block">
        <ProductImage src={deal.imageUrl} alt={deal.productName} className="aspect-square w-full rounded-lg" />
        <span className="absolute left-2 top-2 rounded bg-accent px-1.5 py-0.5 text-xs font-bold text-ink">-{deal.percentOff}%</span>
      </Link>

      <Link to={productUrl} className="mb-2 line-clamp-2 min-h-10 text-sm hover:text-primary">
        {name}
      </Link>

      <div className="mt-auto space-y-3">
        <Price price={deal.salePrice} compareAtPrice={deal.wasPrice} />

        {upcoming ? (
          <p className="rounded-lg bg-primary-light px-3 py-2 text-center text-xs font-semibold text-primary">
            Starts {formatDateTime(deal.startsAt)}
          </p>
        ) : (
          <>
            <Countdown endsAt={deal.endsAt} className="text-xs text-accent-dark" />
            <SoldBar sold={deal.sold} quantity={deal.quantity} />
            <Button
              variant="accent"
              className="w-full"
              disabled={!deal.canBuy}
              isLoading={addingVariantId === deal.productVariantId}
              onClick={() => addToCart({ productVariantId: deal.productVariantId, productName: deal.productName })}
            >
              {deal.canBuy && <ShoppingCart className="h-4 w-4" aria-hidden />}
              {deal.canBuy ? 'Add to cart' : 'Sold out'}
            </Button>
          </>
        )}
      </div>
    </article>
  )
}
