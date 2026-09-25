import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, ShoppingCart, Trash2 } from 'lucide-react'
import { useCart, useRemoveCartItem, useUpdateCartItem } from '../hooks/useCart'
import { ProductImage } from '../../catalog/components/ProductImage'
import { QuantityPicker } from '../../catalog/components/QuantityPicker'
import { Button } from '../../../components/ui/Button'
import { ErrorAlert } from '../../../components/ui/Alert'
import { formatNaira } from '../../../lib/format'
import { getErrorMessage } from '../../../services/api/apiError'
import type { CartItem } from '../../../types/order'

// Same limit as the API (CartRules.MaxQuantityPerItem).
const MAX_QUANTITY_PER_ITEM = 10

function ItemProblem({ item }: { item: CartItem }) {
  if (!item.isAvailable) return <p className="text-xs font-semibold text-danger">No longer available. Remove it to continue.</p>
  if (item.availableQuantity === 0) return <p className="text-xs font-semibold text-danger">Out of stock. Remove it to continue.</p>
  if (!item.inStock)
    return <p className="text-xs font-semibold text-danger">Only {item.availableQuantity} left. Lower the quantity to continue.</p>
  if (item.availableQuantity <= 5) return <p className="text-xs font-semibold text-warning">Only {item.availableQuantity} left</p>
  return null
}

function CartRow({ item }: { item: CartItem }) {
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()
  const productUrl = item.isAvailable ? `/products/${item.productId}` : undefined
  const maxQuantity = Math.max(item.quantity, Math.min(item.availableQuantity, MAX_QUANTITY_PER_ITEM))

  return (
    <li className="flex gap-3 py-4 sm:gap-4">
      {productUrl ? (
        <Link to={productUrl} className="shrink-0">
          <ProductImage src={item.imageUrl} alt={item.productName} className="h-20 w-20 rounded-lg sm:h-24 sm:w-24" />
        </Link>
      ) : (
        <ProductImage src={item.imageUrl} alt={item.productName} className="h-20 w-20 shrink-0 rounded-lg opacity-50 sm:h-24 sm:w-24" />
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:justify-between">
        <div className="min-w-0 space-y-1">
          {productUrl ? (
            <Link to={productUrl} className="line-clamp-2 text-sm font-medium hover:text-primary">
              {item.productName}
            </Link>
          ) : (
            <p className="line-clamp-2 text-sm font-medium text-muted">{item.productName}</p>
          )}
          {item.variantName && <p className="text-xs text-muted">{item.variantName}</p>}
          <p className="text-sm text-muted">{formatNaira(item.unitPrice)} each</p>
          <ItemProblem item={item} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 sm:flex-col sm:flex-nowrap sm:items-end">
          <p className="font-bold">{formatNaira(item.subtotal)}</p>
          <div className="flex items-center gap-2">
            <QuantityPicker
              value={item.quantity}
              max={maxQuantity}
              disabled={!item.isAvailable || updateItem.isPending}
              onChange={(quantity) => updateItem.mutate({ cartItemId: item.id, quantity })}
            />
            <button
              onClick={() => removeItem.mutate({ cartItemId: item.id, productName: item.productName })}
              disabled={removeItem.isPending}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-red-50 hover:text-danger disabled:opacity-50"
              aria-label={`Remove ${item.productName}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </li>
  )
}

export function CartPage() {
  const navigate = useNavigate()
  const { data: cart, isLoading, error } = useCart()

  if (isLoading) {
    return (
      <div className="grid animate-pulse gap-6 lg:grid-cols-[1fr_20rem]" aria-busy="true" aria-label="Loading cart">
        <div className="h-64 rounded-xl bg-white" />
        <div className="h-48 rounded-xl bg-white" />
      </div>
    )
  }

  if (error) return <ErrorAlert>{getErrorMessage(error, 'Could not load your cart.')}</ErrorAlert>

  if (!cart || cart.items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white px-6 py-16 text-center">
        <ShoppingCart className="mx-auto mb-3 h-12 w-12 text-muted" aria-hidden />
        <h1 className="text-lg font-bold">Your cart is empty</h1>
        <p className="mt-1 text-sm text-muted">Browse our categories and find something you like.</p>
        <Link to="/" className="mt-5 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
          Start shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">
        Cart <span className="font-normal text-muted">({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})</span>
      </h1>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
        <section className="rounded-xl border border-border bg-white px-4 sm:px-6">
          <ul className="divide-y divide-border">
            {cart.items.map((item) => (
              <CartRow key={item.id} item={item} />
            ))}
          </ul>
        </section>

        <aside className="space-y-4 rounded-xl border border-border bg-white p-4 sm:p-6 lg:sticky lg:top-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted">Summary</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="font-medium">{formatNaira(cart.total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Delivery</dt>
              <dd className="font-medium text-success">Free</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base">
              <dt className="font-bold">Total</dt>
              <dd className="font-bold">{formatNaira(cart.total)}</dd>
            </div>
          </dl>

          {cart.hasProblems && (
            <p className="flex gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-danger">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              Some items can't be bought right now. Fix them to continue.
            </p>
          )}

          <Button variant="accent" className="w-full py-3" disabled={cart.hasProblems} onClick={() => navigate('/checkout')}>
            Checkout ({formatNaira(cart.total)})
          </Button>
          <Link to="/" className="block text-center text-sm font-semibold text-primary hover:underline">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  )
}