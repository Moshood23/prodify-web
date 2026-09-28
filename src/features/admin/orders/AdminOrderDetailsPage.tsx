import { Link, useParams } from 'react-router-dom'
import { Mail, MapPin, Phone, Store, UserRound } from 'lucide-react'
import { useAdminOrder } from '../hooks'
import { OrderStatusBadge } from '../../orders/components/OrderStatusBadge'
import { SellerOrderStatusBadge } from '../../orders/components/SellerOrderStatusBadge'
import { paymentStatusLabel } from '../../orders/orderLabels'
import { ProductImage } from '../../catalog/components/ProductImage'
import { ErrorAlert } from '../../../components/ui/Alert'
import { formatDateTime, formatNaira } from '../../../lib/format'
import { getErrorMessage, getErrorStatus } from '../../../services/api/apiError'

const stepLabels: Record<string, string> = {
  Pending: 'Order placed',
  Confirmed: 'Confirmed by seller',
  Packed: 'Packed',
  Shipped: 'Shipped',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
}

export function AdminOrderDetailsPage() {
  const { orderId } = useParams()
  const { data, isLoading, error } = useAdminOrder(orderId)

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl bg-white" aria-busy="true" aria-label="Loading order" />
  if (error || !data) {
    return <ErrorAlert>{getErrorStatus(error) === 404 ? 'Order not found.' : getErrorMessage(error, 'Could not load the order.')}</ErrorAlert>
  }

  const { order, customer } = data
  const address = order.shippingAddress

  return (
    <div className="max-w-6xl space-y-4">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link to="/admin/orders" className="hover:text-primary">
          Orders
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{order.orderNumber}</span>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold">
            Order {order.orderNumber} <OrderStatusBadge status={order.status} />
          </h1>
          <p className="text-sm text-muted">Placed on {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">{formatNaira(order.total)}</p>
          <p className="text-sm text-muted">{order.paymentMethod === 'Card' ? `Card · ${paymentStatusLabel(order)}` : paymentStatusLabel(order)}</p>
        </div>
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-4">
          {order.sellerOrders.map((sellerOrder) => {
            const progress = data.sellerProgress.find((p) => p.sellerOrderId === sellerOrder.id)
            return (
              <section key={sellerOrder.id} className="rounded-xl border border-border bg-white p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <Link to={`/admin/sellers/${sellerOrder.sellerId}`} className="flex items-center gap-2 text-sm font-semibold hover:text-primary">
                    <Store className="h-4 w-4" aria-hidden /> {sellerOrder.sellerName}
                  </Link>
                  <SellerOrderStatusBadge status={sellerOrder.status} forSeller />
                </div>

                <ul className="divide-y divide-border">
                  {sellerOrder.items.map((item) => (
                    <li key={item.productVariantId} className="flex gap-3 py-3">
                      <ProductImage src={item.imageUrl} alt={item.productName} className="h-12 w-12 shrink-0 rounded-lg" />
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

                {progress && progress.history.length > 0 && (
                  <ol className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-muted">
                    {progress.history.map((step, index) => (
                      <li key={index}>
                        <span className="font-semibold text-ink">{stepLabels[step.status] ?? step.status}</span> {formatDateTime(step.occurredAt)}
                        {step.notes && <span> · {step.notes}</span>}
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            )
          })}
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-border bg-white p-4 text-sm">
            <h2 className="mb-2 flex items-center gap-2 font-bold">
              <UserRound className="h-4 w-4 text-primary" aria-hidden /> Customer
            </h2>
            <Link to={`/admin/customers/${customer.id}`} className="font-semibold hover:text-primary">
              {customer.name}
            </Link>
            <p className="flex items-center gap-1.5 text-muted">
              <Mail className="h-3.5 w-3.5" aria-hidden /> {customer.email}
            </p>
            {customer.phoneNumber && (
              <p className="flex items-center gap-1.5 text-muted">
                <Phone className="h-3.5 w-3.5" aria-hidden /> {customer.phoneNumber}
              </p>
            )}
          </section>

          <section className="rounded-xl border border-border bg-white p-4 text-sm">
            <h2 className="mb-2 flex items-center gap-2 font-bold">
              <MapPin className="h-4 w-4 text-primary" aria-hidden /> Deliver to
            </h2>
            <p className="font-semibold">{address.recipientName}</p>
            <p>{address.addressLine1}</p>
            {address.addressLine2 && <p>{address.addressLine2}</p>}
            <p>
              {address.city}, {address.state}
            </p>
            <p className="text-muted">{address.phoneNumber}</p>
          </section>
        </aside>
      </div>
    </div>
  )
}