import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ClipboardList } from 'lucide-react'
import { useAdminSellerOrders } from '../hooks'
import { FilterChips } from '../components/FilterChips'
import { SellerOrderStatusBadge } from '../../orders/components/SellerOrderStatusBadge'
import { Pagination } from '../../catalog/components/Pagination'
import { ErrorAlert } from '../../../components/ui/Alert'
import { formatDateTime, formatNaira } from '../../../lib/format'
import { getErrorMessage } from '../../../services/api/apiError'
import type { SellerOrderStatus } from '../../../types/sellerOrder'

const statuses: { value?: SellerOrderStatus; label: string }[] = [
  { label: 'All' },
  { value: 'Pending', label: 'To confirm' },
  { value: 'Confirmed', label: 'To pack' },
  { value: 'Packed', label: 'To ship' },
  { value: 'Shipped', label: 'Shipped' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Cancelled', label: 'Cancelled' },
]

// One seller's part of each order, as the seller sees it in their Seller Centre.
export function SellerOrderList({ sellerId }: { sellerId: string }) {
  const [status, setStatus] = useState<SellerOrderStatus>()
  const [page, setPage] = useState(1)
  const { data, isLoading, isFetching, error } = useAdminSellerOrders({ sellerId, status, pageNumber: page, pageSize: 10 })

  return (
    <div className="space-y-3">
      <FilterChips
        label="Seller order status"
        options={statuses}
        value={status}
        onChange={(value) => {
          setStatus(value)
          setPage(1)
        }}
      />

      {error && <ErrorAlert>{getErrorMessage(error, 'Could not load orders.')}</ErrorAlert>}

      <section className={`overflow-hidden rounded-xl border border-border bg-white ${isFetching && !isLoading ? 'opacity-60' : ''}`}>
        {isLoading ? (
          <div className="h-32 animate-pulse" aria-busy="true" aria-label="Loading orders" />
        ) : !data || data.items.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <ClipboardList className="mx-auto mb-3 h-8 w-8 text-muted" aria-hidden />
            <p className="text-sm text-muted">No orders here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {data.items.map((order) => (
              <li key={order.id}>
                <Link to={`/admin/orders/${order.orderId}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                      {order.orderNumber} <SellerOrderStatusBadge status={order.status} forSeller />
                    </p>
                    <p className="line-clamp-1 text-sm">{order.summary}</p>
                    <p className="truncate text-xs text-muted">
                      {order.customerName} · {order.city}, {order.state} · {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">{formatNaira(order.total)}</p>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {data && <Pagination page={data.pageNumber} totalPages={data.totalPages} onChange={setPage} />}
    </div>
  )
}