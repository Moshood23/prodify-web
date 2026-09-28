import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { OrderStatusBadge } from '../../orders/components/OrderStatusBadge'
import { paymentStatusLabel } from '../../orders/orderLabels'
import { ProductImage } from '../../catalog/components/ProductImage'
import { formatDateTime, formatNaira } from '../../../lib/format'
import type { AdminOrderSummary } from '../../../types/admin'

// Order rows shared by the Orders page and a customer's page.
export function AdminOrderRows({ orders, showCustomer = true }: { orders: AdminOrderSummary[]; showCustomer?: boolean }) {
  return (
    <ul className="divide-y divide-border">
      {orders.map((order) => (
        <li key={order.id}>
          <Link to={`/admin/orders/${order.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface">
            <ProductImage src={order.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                {order.orderNumber} <OrderStatusBadge status={order.status} />
              </p>
              <p className="line-clamp-1 text-sm">{order.summary}</p>
              <p className="truncate text-xs text-muted">
                {showCustomer && `${order.customerName} · `}
                {formatDateTime(order.createdAt)}
                {order.sellerCount > 1 && ` · ${order.sellerCount} sellers`}
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold">{formatNaira(order.total)}</p>
              <p className="text-xs text-muted">{paymentStatusLabel(order)}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  )
}