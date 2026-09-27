import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, ClipboardList, Search } from 'lucide-react'
import { useSellerOrderCounts, useSellerOrders } from '../hooks'
import { SellerOrderStatusBadge } from '../../../orders/components/SellerOrderStatusBadge'
import { ProductImage } from '../../../catalog/components/ProductImage'
import { Pagination } from '../../../catalog/components/Pagination'
import { ErrorAlert } from '../../../../components/ui/Alert'
import { formatDateTime, formatNaira } from '../../../../lib/format'
import { getErrorMessage } from '../../../../services/api/apiError'
import type { SellerOrderCounts, SellerOrderStatus } from '../../../../types/sellerOrder'

const tabs: { status?: SellerOrderStatus; label: string; count?: keyof SellerOrderCounts }[] = [
  { status: 'Pending', label: 'To confirm', count: 'toConfirm' },
  { status: 'Confirmed', label: 'To pack', count: 'toPack' },
  { status: 'Packed', label: 'To ship', count: 'toShip' },
  { status: 'Shipped', label: 'Shipped', count: 'shipped' },
  { status: 'Delivered', label: 'Delivered', count: 'delivered' },
  { status: 'Cancelled', label: 'Cancelled', count: 'cancelled' },
  { label: 'All' },
]

export function SellerOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = (searchParams.get('status') as SellerOrderStatus | null) ?? undefined
  const search = searchParams.get('q') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const [searchText, setSearchText] = useState(search)

  const { data: counts } = useSellerOrderCounts()
  const { data, isLoading, isFetching, error } = useSellerOrders({ status, search: search || undefined, pageNumber: page, pageSize: 20 })

  function update(changes: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    setSearchParams(next)
  }

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    update({ q: searchText.trim() || undefined, page: undefined })
  }

  return (
    <div className="max-w-5xl space-y-4">
      <h1 className="text-2xl font-bold">Orders</h1>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Order status" className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const active = tab.status === status
            const count = counts && tab.count ? counts[tab.count] : undefined
            return (
              <button
                key={tab.label}
                onClick={() => update({ status: tab.status, page: undefined })}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                  active ? 'border-primary bg-primary text-white' : 'border-border bg-white hover:border-primary'
                }`}
              >
                {tab.label}
                {count !== undefined && <span className={`ml-1.5 ${active ? 'text-primary-light' : 'text-muted'}`}>{count}</span>}
              </button>
            )
          })}
        </nav>

        <form onSubmit={handleSearch} role="search" className="flex items-center rounded-lg border border-border bg-white px-2">
          <Search className="h-4 w-4 text-muted" aria-hidden />
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Order number"
            aria-label="Search orders"
            maxLength={50}
            className="w-44 bg-transparent px-2 py-1.5 text-sm outline-none sm:w-52"
          />
        </form>
      </div>

      {error && <ErrorAlert>{getErrorMessage(error, 'Could not load your orders.')}</ErrorAlert>}

      <section className={`overflow-hidden rounded-xl border border-border bg-white ${isFetching && !isLoading ? 'opacity-60' : ''}`}>
        {isLoading ? (
          <div className="h-40 animate-pulse" aria-busy="true" aria-label="Loading orders" />
        ) : !data || data.items.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <ClipboardList className="mx-auto mb-3 h-10 w-10 text-muted" aria-hidden />
            <p className="text-sm text-muted">
              {status === 'Pending' ? 'No new orders to confirm.' : search ? 'No orders match.' : 'No orders here yet.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {data.items.map((order) => (
              <li key={order.id}>
                <Link to={`/seller/orders/${order.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface">
                  <ProductImage src={order.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-md" />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                      {order.orderNumber} <SellerOrderStatusBadge status={order.status} forSeller />
                    </p>
                    <p className="line-clamp-1 text-sm">{order.summary}</p>
                    <p className="truncate text-xs text-muted">
                      {order.customerName} · {order.city}, {order.state} · {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold">{formatNaira(order.total)}</p>
                    <p className="text-xs text-muted">{order.paymentMethod === 'PayOnDelivery' ? 'Pay on delivery' : 'Paid'}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {data && <Pagination page={data.pageNumber} totalPages={data.totalPages} onChange={(next) => update({ page: next === 1 ? undefined : String(next) })} />}
    </div>
  )
}