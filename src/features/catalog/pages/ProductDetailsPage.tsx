import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PackageX, ShoppingCart, Store, Truck } from 'lucide-react'
import { useProduct } from '../hooks/useCatalog'
import { useAddToCart } from '../../cart/hooks/useCart'
import { ImageGallery } from '../components/ImageGallery'
import { Price } from '../components/Price'
import { QuantityPicker } from '../components/QuantityPicker'
import { Button } from '../../../components/ui/Button'
import { ErrorAlert } from '../../../components/ui/Alert'
import { getErrorMessage, getErrorStatus } from '../../../services/api/apiError'
import type { ProductVariant } from '../../../types/catalog'

// Most people buy one or two; this also stops accidental huge orders.
const MAX_QUANTITY_PER_ORDER = 10
const LOW_STOCK_THRESHOLD = 5

function StockStatus({ variant }: { variant: ProductVariant | undefined }) {
  if (!variant || !variant.inStock) return <p className="text-sm font-semibold text-danger">Out of stock</p>

  if (variant.availableQuantity <= LOW_STOCK_THRESHOLD)
    return <p className="text-sm font-semibold text-warning">Only {variant.availableQuantity} left, order soon</p>

  return <p className="text-sm font-semibold text-success">In stock</p>
}

function DetailsSkeleton() {
  return (
    <div className="grid animate-pulse gap-8 md:grid-cols-2" aria-busy="true" aria-label="Loading product">
      <div className="aspect-square rounded-xl bg-white" />
      <div className="space-y-4">
        <div className="h-4 w-24 rounded bg-white" />
        <div className="h-7 w-3/4 rounded bg-white" />
        <div className="h-8 w-40 rounded bg-white" />
        <div className="h-24 rounded bg-white" />
        <div className="h-11 rounded bg-white" />
      </div>
    </div>
  )
}

export function ProductDetailsPage() {
  const { productId } = useParams()
  // The key gives every product a fresh page state (chosen option, quantity).
  return <ProductDetails key={productId} productId={productId} />
}

function ProductDetails({ productId }: { productId: string | undefined }) {
  const { data: product, isLoading, error } = useProduct(productId)
  const { addToCart, isAdding } = useAddToCart()

  const [chosenVariantId, setChosenVariantId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  if (isLoading) return <DetailsSkeleton />

  if (error || !product) {
    if (getErrorStatus(error) === 404 || !error) {
      return (
        <div className="rounded-xl border border-border bg-white px-6 py-16 text-center">
          <PackageX className="mx-auto mb-3 h-10 w-10 text-muted" aria-hidden />
          <h1 className="text-lg font-bold">This product is no longer available</h1>
          <Link to="/" className="mt-4 inline-block font-semibold text-primary hover:underline">
            Continue shopping
          </Link>
        </div>
      )
    }
    return <ErrorAlert>{getErrorMessage(error, 'Could not load this product.')}</ErrorAlert>
  }

  // Default to the first variant that is in stock (variants come cheapest first).
  const variant =
    product.variants.find((v) => v.id === chosenVariantId) ?? product.variants.find((v) => v.inStock) ?? product.variants[0]

  const maxQuantity = Math.max(1, Math.min(variant?.availableQuantity ?? 1, MAX_QUANTITY_PER_ORDER))
  const hasOptions = product.variants.length > 1

  function chooseVariant(id: string) {
    setChosenVariantId(id)
    setQuantity(1)
  }

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        <Link to={`/category/${product.categoryId}`} className="hover:text-primary">
          {product.categoryName}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-8 rounded-xl border border-border bg-white p-4 sm:p-6 md:grid-cols-2">
        <ImageGallery images={product.images} productName={product.name} />

        <div className="space-y-5">
          <div>
            {product.brandName && <p className="text-sm font-medium uppercase tracking-wide text-muted">{product.brandName}</p>}
            <h1 className="text-2xl font-bold">{product.name}</h1>
          </div>

          {variant && <Price price={variant.price} compareAtPrice={variant.compareAtPrice} size="lg" />}

          {hasOptions && (
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Options</legend>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => chooseVariant(v.id)}
                    aria-pressed={v.id === variant?.id}
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      v.id === variant?.id
                        ? 'border-primary bg-primary-light font-semibold text-primary'
                        : 'border-border hover:border-primary'
                    } ${v.inStock ? '' : 'text-muted line-through'}`}
                  >
                    {v.name ?? v.sku}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <StockStatus variant={variant} />

          {!product.isActive && (
            <p className="rounded-md bg-accent-light px-3 py-2 text-sm text-accent-dark">
              This product is hidden from shoppers. Only you can see this page.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <QuantityPicker value={quantity} max={maxQuantity} onChange={setQuantity} disabled={!variant?.inStock} />
            <Button
              variant="accent"
              className="flex-1 py-3"
              disabled={!variant?.inStock}
              isLoading={isAdding}
              onClick={() => variant && addToCart({ productVariantId: variant.id, quantity, productName: product.name })}
            >
              <ShoppingCart className="h-4 w-4" aria-hidden />
              {variant?.inStock ? 'Add to cart' : 'Out of stock'}
            </Button>
          </div>

          <div className="space-y-2 rounded-lg bg-surface p-3 text-sm">
            <p className="flex items-center gap-2">
              <Store className="h-4 w-4 text-primary" aria-hidden />
              Sold by <span className="font-semibold">{product.sellerName}</span>
            </p>
            <p className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" aria-hidden />
              Delivery fee and date are shown at checkout
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {product.description && (
          <section className="rounded-xl border border-border bg-white p-4 sm:p-6">
            <h2 className="mb-2 text-lg font-bold">Description</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{product.description}</p>
          </section>
        )}

        {product.attributes.length > 0 && (
          <section className="rounded-xl border border-border bg-white p-4 sm:p-6">
            <h2 className="mb-2 text-lg font-bold">Specifications</h2>
            <dl className="divide-y divide-border text-sm">
              {product.attributes.map((attribute) => (
                <div key={attribute.name} className="grid grid-cols-2 gap-4 py-2">
                  <dt className="text-muted">{attribute.name}</dt>
                  <dd className="font-medium">{attribute.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>
    </div>
  )
}