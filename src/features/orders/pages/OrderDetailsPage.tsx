import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { CheckCircle2, CreditCard, MapPin, PackageX, Store } from 'lucide-react'
import { PaymentDeclinedError, useCancelOrder, useOrder, usePayOrder } from '../hooks/useOrders'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { paymentStatusLabel } from '../orderLabels'
import { CardPaymentForm } from '../components/CardPaymentForm'
import { ProductImage } from '../../catalog/components/ProductImage'
import { Button } from '../../../components/ui/Button'
import { ErrorAlert } from '../../../components/ui/Alert'
import { formatDateTime, formatNaira } from '../../../lib/format'
import { getErrorMessage, getErrorStatus } from '../../../services/api/apiError'
import type { OrderDetails } from '../../../types/order'

function PlacedBanner({ order }: { order: OrderDetails }) {
  const message = order.isPaid
    ? 'Payment received. We will let you know when your order ships.'
    : order.paymentMethod === 'PayOnDelivery'
      ? `Please have ${formatNaira(order.total)} ready when your order arrives.`
      : 'Complete your payment below to confirm your order.'

  return (
    <div role="status" className="flex gap-3 rounded-xl border border-primary bg-primary-light p-4">
      <CheckCircle2 className="h-6 w-6 shrink-0 text-primary" aria-hidden />
      <div>
        <p className="font-semibold text-primary">Thank you! Your order has been placed.</p>
        <p className="text-sm text-slate-700">{message}</p>
      </div>
    </div>
  )
}

function CancelOrder({ order }: { order: OrderDetails }) {
  const [confirming, setConfirming] = useState(false)
  const cancel = useCancelOrder(order.id)

  if (!order.canCancel) return null

  return (
    <div className="space-y-2">
      {cancel.error && <ErrorAlert>{getErrorMessage(cancel.error, 'Could not cancel this order.')}</ErrorAlert>}
      {confirming ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-red-50 p-3 text-sm">
          <span className="font-medium text-danger">Cancel this order?</span>
          <Button variant="danger" isLoading={cancel.isPending} onClick={() => cancel.mutate('Cancelled by customer')}>
            Yes, cancel it
          </Button>
          <Button variant="outline" onClick={() => setConfirming(false)} disabled={cancel.isPending}>
            Keep order
          </Button>
        </div>
      ) : (
        <button onClick={() => setConfirming(true)} className="text-sm font-semibold text-danger hover:underline">
          Cancel order
        </button>
      )}
    </div>
  )
}

export function OrderDetailsPage() {
  const { orderId } = useParams()
  const [searchParams] = useSearchParams()
  const { data: order, isLoading, error } = useOrder(orderId)
  const pay = usePayOrder(orderId ?? '')

  const justPlaced = searchParams.has('placed') || searchParams.has('pay')

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading order">
        <div className="h-20 rounded-xl bg-white" />
        <div className="h-64 rounded-xl bg-white" />
      </div>
    )
  }

  if (error || !order) {
    if (getErrorStatus(error) === 404 || !error) {
      return (
        <div className="rounded-xl border border-border bg-white px-6 py-16 text-center">
          <PackageX className="mx-auto mb-3 h-10 w-10 text-muted" aria-hidden />
          <h1 className="text-lg font-bold">Order not found</h1>
          <Link to="/orders" className="mt-4 inline-block font-semibold text-primary hover:underline">
            Back to my orders
          </Link>
        </div>
      )
    }
    return <ErrorAlert>{getErrorMessage(error, 'Could not load this order.')}</ErrorAlert>
  }

  const address = order.shippingAddress
  const payError =
    pay.error instanceof PaymentDeclinedError ? pay.error.message : pay.error ? getErrorMessage(pay.error, 'Payment failed.') : null

  return (
    <div className="space-y-4">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link to="/orders" className="hover:text-primary">
          My orders
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{order.orderNumber}</span>
      </nav>

      {justPlaced && order.status !== 'Cancelled' && <PlacedBanner order={order} />}

      <header className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-white p-4 sm:p-6">
        <div>
          <h1 className="text-xl font-bold">Order {order.orderNumber}</h1>
          <p className="text-sm text-muted">Placed on {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="text-right">
          <OrderStatusBadge status={order.status} />
          <p className="mt-1 text-lg font-bold">{formatNaira(order.total)}</p>
        </div>
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          {order.sellerOrders.map((sellerOrder) => (
            <section key={sellerOrder.id} className="rounded-xl border border-border bg-white p-4 sm:p-6">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
                <Store className="h-4 w-4" aria-hidden /> Sold by {sellerOrder.sellerName}
              </h2>
              <ul className="divide-y divide-border">
                {sellerOrder.items.map((item) => (
                  <li key={item.productVariantId} className="flex gap-3 py-3">
                    <ProductImage src={item.imageUrl} alt={item.productName} className="h-16 w-16 shrink-0 rounded-lg" />
                    <div className="min-w-0 flex-1 text-sm">
                      {item.productId ? (
                        <Link to={`/products/${item.productId}`} className="line-clamp-2 font-medium hover:text-primary">
                          {item.productName}
                        </Link>
                      ) : (
                        <p className="line-clamp-2 font-medium">{item.productName}</p>
                      )}
                      <p className="text-muted">
                        {item.quantity} × {formatNaira(item.unitPrice)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">{formatNaira(item.subtotal)}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <aside className="space-y-4">
          {order.canPay && (
            <section className="rounded-xl border-2 border-accent bg-white p-4 sm:p-6">
              <h2 className="mb-1 flex items-center gap-2 font-bold">
                <CreditCard className="h-5 w-5 text-primary" aria-hidden /> Complete your payment
              </h2>
              <p className="mb-4 text-sm text-muted">Your items are held for 30 minutes after you place the order.</p>
              {payError && (
                <div className="mb-3">
                  <ErrorAlert>{payError}</ErrorAlert>
                </div>
              )}
              <CardPaymentForm amount={order.total} isPaying={pay.isPending} onPay={(token) => pay.mutate(token)} />
            </section>
          )}

          <section className="space-y-3 rounded-xl border border-border bg-white p-4 text-sm sm:p-6">
            <h2 className="flex items-center gap-2 font-bold">
              <MapPin className="h-4 w-4 text-primary" aria-hidden /> Delivery address
            </h2>
            <p>
              <span className="font-semibold">{address.recipientName}</span>
              <br />
              {address.addressLine1}
              {address.addressLine2 && (
                <>
                  <br />
                  {address.addressLine2}
                </>
              )}
              <br />
              {address.city}, {address.state}
              <br />
              {address.phoneNumber}
            </p>
          </section>

          <section className="space-y-2 rounded-xl border border-border bg-white p-4 text-sm sm:p-6">
            <h2 className="font-bold">Payment</h2>
            <dl className="space-y-1">
              <div className="flex justify-between">
                <dt className="text-muted">Method</dt>
                <dd>{order.paymentMethod === 'Card' ? 'Card' : 'Pay on delivery'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Status</dt>
                <dd className={order.isPaid ? 'font-semibold text-success' : ''}>{paymentStatusLabel(order)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Delivery</dt>
                <dd>Free</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-1 font-bold">
                <dt>Total</dt>
                <dd>{formatNaira(order.total)}</dd>
              </div>
            </dl>
            {!order.isPaid && !order.canPay && order.paymentMethod === 'Card' && order.status !== 'Cancelled' && (
              <p className="rounded-md bg-surface px-3 py-2 text-xs text-muted">
                This order wasn't paid within 30 minutes, so its items were released. You can cancel it and order again.
              </p>
            )}
          </section>

          <CancelOrder order={order} />
        </aside>
      </div>
    </div>
  )
}