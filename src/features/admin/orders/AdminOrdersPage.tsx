import { ClipboardList } from 'lucide-react'
import { useAdminOrders } from '../hooks'
import { useUrlFilters } from '../useUrlFilters'
import { FilterChips } from '../components/FilterChips'
import { SearchBox } from '../components/SearchBox'
import { AdminOrderRows } from './AdminOrderRows'
import { Pagination } from '../../catalog/components/Pagination'
import { ErrorAlert } from '../../../components/ui/Alert'
import { getErrorMessage } from '../../../services/api/apiError'
import type { AdminOrderStage } from '../../../types/admin'
import type { PaymentMethod } from '../../../types/order'

const stages: { value?: AdminOrderStage; label: string }[] = [
  { label: 'All' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'awaiting_payment', label: 'Awaiting payment' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const payments: { value?: PaymentMethod; label: string }[] = [
  { label: 'Any payment' },
  { value: 'Card', label: 'Card' },
  { value: 'PayOnDelivery', label: 'Pay on delivery' },
]

const dateClass = 'rounded-lg border border-border bg-white px-2 py-1.5 text-sm outline-none focus:border-primary'

export function AdminOrdersPage() {
  const filters = useUrlFilters()
  const stage = filters.get('stage') as AdminOrderStage | undefined
  const paymentMethod = filters.get('payment') as PaymentMethod | undefined
  const search = filters.get('q')
  const from = filters.get('from')
  const to = filters.get('to')

  const { data, isLoading, isFetching, error } = useAdminOrders({
    stage,
    paymentMethod,
    search,
    from,
    to,
    pageNumber: filters.page,
    pageSize: 20,
  })

  return (
    <div className="max-w-6xl space-y-4">
      <h1 className="text-2xl font-bold">Orders</h1>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterChips label="Order stage" options={stages} value={stage} onChange={(value) => filters.update({ stage: value })} />
        <SearchBox initialValue={search} label="Search orders" placeholder="Order number, customer name or email" onSearch={(q) => filters.update({ q })} />
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <FilterChips label="Payment method" options={payments} value={paymentMethod} onChange={(value) => filters.update({ payment: value })} />
        <label className="flex items-center gap-2">
          <span className="text-muted">From</span>
          <input type="date" value={from ?? ''} max={to} onChange={(e) => filters.update({ from: e.target.value || undefined })} className={dateClass} />
        </label>
        <label className="flex items-center gap-2">
          <span className="text-muted">To</span>
          <input type="date" value={to ?? ''} min={from} onChange={(e) => filters.update({ to: e.target.value || undefined })} className={dateClass} />
        </label>
        {(from || to) && (
          <button onClick={() => filters.update({ from: undefined, to: undefined })} className="font-semibold text-primary hover:underline">
            Clear dates
          </button>
        )}
      </div>

      {error && <ErrorAlert>{getErrorMessage(error, 'Could not load orders.')}</ErrorAlert>}

      <section className={`overflow-hidden rounded-xl border border-border bg-white ${isFetching && !isLoading ? 'opacity-60' : ''}`}>
        {isLoading ? (
          <div className="h-40 animate-pulse" aria-busy="true" aria-label="Loading orders" />
        ) : !data || data.items.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <ClipboardList className="mx-auto mb-3 h-10 w-10 text-muted" aria-hidden />
            <p className="text-sm text-muted">No orders match.</p>
          </div>
        ) : (
          <>
            <p className="border-b border-border px-4 py-2 text-xs text-muted">{data.totalCount} orders</p>
            <AdminOrderRows orders={data.items} />
          </>
        )}
      </section>

      {data && <Pagination page={data.pageNumber} totalPages={data.totalPages} onChange={(next) => filters.update({ page: next === 1 ? undefined : String(next) })} />}
    </div>
  )
}