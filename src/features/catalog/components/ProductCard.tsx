import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { discountPercent } from '../../../lib/format'
import { useAddToCart } from '../../cart/hooks/useCart'
import type { ProductSummary } from '../../../types/catalog'
import { Price } from './Price'
import { ProductImage } from './ProductImage'

export function ProductCard({ product }: { product: ProductSummary }) {
  const { addToCart, addingVariantId } = useAddToCart()
  const discount = discountPercent(product.price, product.compareAtPrice)
  const productUrl = `/products/${product.id}`

  // Products with options (sizes, storage, ...) must be chosen on the details page.
  const hasOptions = product.variantCount > 1

  return (
    <article className="group flex flex-col rounded-xl border border-border bg-white p-3 transition-shadow hover:shadow-md">
      <Link to={productUrl} className="relative mb-3 block">
        <ProductImage src={product.imageUrl} alt={product.name} className="aspect-square w-full rounded-lg" />
        {discount !== null && (
          <span className="absolute left-2 top-2 rounded bg-accent px-1.5 py-0.5 text-xs font-bold text-ink">-{discount}%</span>
        )}
        {!product.inStock && (
          <span className="absolute inset-x-2 bottom-2 rounded bg-ink/80 py-1 text-center text-xs font-semibold text-white">
            Out of stock
          </span>
        )}
      </Link>

      {product.brandName && <p className="text-xs font-medium uppercase tracking-wide text-muted">{product.brandName}</p>}

      <Link to={productUrl} className="mb-2 line-clamp-2 min-h-10 text-sm hover:text-primary">
        {product.name}
      </Link>

      <div className="mt-auto space-y-3">
        <Price price={product.price} compareAtPrice={product.compareAtPrice} />

        {hasOptions ? (
          <Link
            to={productUrl}
            className="flex w-full items-center justify-center rounded-lg border border-primary px-3 py-2 text-sm font-semibold text-primary hover:bg-primary-light"
          >
            Choose options
          </Link>
        ) : (
          <Button
            className="w-full"
            disabled={!product.inStock}
            isLoading={addingVariantId === product.defaultVariantId}
            onClick={() => addToCart({ productVariantId: product.defaultVariantId, productName: product.name })}
          >
            {product.inStock && <ShoppingCart className="h-4 w-4" aria-hidden />}
            {product.inStock ? 'Add to cart' : 'Out of stock'}
          </Button>
        )}
      </div>
    </article>
  )
}