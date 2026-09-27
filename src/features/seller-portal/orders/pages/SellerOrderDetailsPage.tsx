import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Phone, Truck } from 'lucide-react'
import { useSellerOrder } from '../hooks'
import { OrderActions } from '../components/OrderActions'
import { SellerOrderStatusBadge } from '../../../orders/components/SellerOrderStatusBadge'
import { ProductImage } from '../../../catalog/components/ProductImage'
import { ErrorAlert } from '../../../../components/ui/Alert'
import { formatDateTime, formatNaira } from '../../../../lib/format'
import { getErrorMessage, getErrorStatus } from '../../../../services/api/apiError'
import type { SellerOrderStatus } from '../../../../types/sellerOrder'

const historyLabels: Record<SellerOrderStatus, string> = {
  Pending: 'Order placed',
  Confirmed: 'Confirmed',
  Packed: 'Packed',
  Shipped: 'Shipped',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
}

export function SellerOrderDetailsPage() {
  const { orderId } = useParams()
  const { data: order, isLoading, error } = useSellerOrder(orderId)

  return (
    <div className="max-w-5xl space-y-4">
      <Link to="/seller/orders" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Orders
      </Link>

      {isLoading && <div className="h-64 animate-pulse rounded-xl bg-white" aria-busy="true" aria-label="Loading order" />}
      {error && (
        <ErrorAlert>{getErrorStatus(error) === 404 ? 'This order does not exist or is not yours.' : getErrorMessage(error, 'Could not load the order.')}</ErrorAlert>
      )}

      {order && (
        <>
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold">
                Order {order.orderNumber} <SellerOrderStatusBadge status={order.status} forSeller />
              </h1>
              <p className="text-sm text-muted">Placed on {formatDateTime(order.createdAt)}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{formatNaira(order.total)}</p>
              <p className="text-sm text-muted">
                {order.paymentMethod === 'PayOnDelivery' ? 'Customer pays on delivery' : 'Paid online'}
              </p>
            </div>
          </header>

          <div className="grid items-start gap-4 lg:grid-cols-[1fr_20rem]">
            <div className="min-w-0 space-y-4">
              <section className="rounded-xl border border-border bg-white p-4">
                <h2 className="mb-2 font-bold">Items to send</h2>
                <ul className="divide-y divide-border">
                  {order.items.map((item) => (
                    <li key={item.productVariantId} className="flex gap-3 py-3">
                      <ProductImage src={item.imageUrl} alt={item.productName} className="h-14 w-14 shrink-0 rounded-lg" />
                      <div className="min-w-0 flex-1 text-sm">
                        {item.productId ? (
                          <Link to={`/seller/products/${item.productId}`} className="line-clamp-2 font-medium hover:text-primary">
                            {item.productName}
                          </Link>
                        ) : (
                          <p className="line-clamp-2 font-medium">{item.productName}</p>
                        )}
                        {item.sku && <p className="text-xs text-muted">SKU {item.sku}</p>}
                        <p className="text-muted">
                          {item.quantity} × {formatNaira(item.unitPrice)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">{formatNaira(item.subtotal)}</p>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-xl border border-border bg-white p-4">
                <h2 className="mb-3 font-bold">History</h2>
                <ol className="space-y-3 border-l-2 border-border pl-4">
                  {order.history.map((entry, index) => (
                    <li key={index} className="relative text-sm">
                      <span className="absolute -left-[1.4rem] top-1 h-3 w-3 rounded-full border-2 border-white bg-primary" aria-hidden />
                      <p className="font-medium">{historyLabels[entry.status] ?? entry.status}</p>
                      {entry.notes && <p className="text-muted">{entry.notes}</p>}
                      <p className="text-xs text-muted">{formatDateTime(entry.occurredAt)}</p>
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            {/* On phones the next step comes first, above the items. */}
            <aside className="order-first space-y-4 lg:order-last">
              <OrderActions order={order} />

              <section className="rounded-xl border border-border bg-white p-4 text-sm">
                <h2 className="mb-2 flex items-center gap-2 font-bold">
                  <MapPin className="h-4 w-4 text-primary" aria-hidden /> Deliver to
                </h2>
                <p className="font-semibold">{order.shippingAddress.recipientName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}
                </p>
                <a href={`tel:${order.shippingAddress.phoneNumber}`} className="mt-2 inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
                  <Phone className="h-4 w-4" aria-hidden /> {order.shippingAddress.phoneNumber}
                </a>
              </section>

              {order.shipment && (
                <section className="rounded-xl border border-border bg-white p-4 text-sm">
                  <h2 className="mb-2 flex items-center gap-2 font-bold">
                    <Truck className="h-4 w-4 text-primary" aria-hidden /> Shipment
                  </h2>
                  <p>Delivered by {order.shipment.carrier}</p>
                  {order.shipment.trackingNumber && <p className="text-muted">Tracking number {order.shipment.trackingNumber}</p>}
                  {order.shipment.shippedAt && <p className="text-muted">Sent {formatDateTime(order.shipment.shippedAt)}</p>}
                  {order.shipment.deliveredAt && <p className="text-muted">Delivered {formatDateTime(order.shipment.deliveredAt)}</p>}
                </section>
              )}
            </aside>
          </div>
        </>
      )}
    </div>
  )
}