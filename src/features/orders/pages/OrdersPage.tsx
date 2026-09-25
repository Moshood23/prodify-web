import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, Package } from 'lucide-react'
import { useMyOrders } from '../hooks/useOrders'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { paymentStatusLabel } from '../orderLabels'
import { ProductImage } from '../../catalog/components/ProductImage'
import { Pagination } from '../../catalog/components/Pagination'
import { ErrorAlert } from '../../../components/ui/Alert'
import { formatDateTime, formatNaira } from '../../../lib/format'
import { getErrorMessage } from '../../../services/api/apiError'

export function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const { data, isLoading, error } = useMyOrders(page)

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">My orders</h1>

      {error && <ErrorAlert>{getErrorMessage(error, 'Could not load your orders.')}</ErrorAlert>}

      {isLoading && (
        <div className="animate-pulse space-y-3" aria-busy="true" aria-label="Loading orders">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-white" />
          ))}
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="rounded-xl border border-border bg-white px-6 py-16 text-center">
          <Package className="mx-auto mb-3 h-12 w-12 text-muted" aria-hidden />
          <p className="font-semibold">You haven't placed any orders yet</p>
          <Link to="/" className="mt-4 inline-block font-semibold text-primary hover:underline">
            Start shopping
          </Link>
        </div>
      )}

      {data && data.items.length > 0 && (
        <ul className="space-y-3">
          {data.items.map((order) => (
            <li key={order.id}>
              <Link
                to={`/orders/${order.id}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-white p-3 hover:border-primary sm:gap-4 sm:p-4"
              >
                <ProductImage src={order.imageUrl} alt="" className="h-16 w-16 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="line-clamp-1 text-sm font-medium">{order.summary}</p>
                  <p className="text-xs text-muted">
                    {order.orderNumber} · {formatDateTime(order.createdAt)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <OrderStatusBadge status={order.status} />
                    <span className="text-xs text-muted">{paymentStatusLabel(order)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatNaira(order.total)}</p>
                  <p className="text-xs text-muted">
                    {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <ChevronRight className="hidden h-5 w-5 text-muted sm:block" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {data && (
        <Pagination
          page={data.pageNumber}
          totalPages={data.totalPages}
          onChange={(next) => setSearchParams(next === 1 ? {} : { page: String(next) })}
        />
      )}
    </div>
  )
}