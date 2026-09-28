import { Link } from 'react-router-dom'
import { ChevronRight, Users } from 'lucide-react'
import { useAdminCustomers } from '../hooks'
import { useUrlFilters } from '../useUrlFilters'
import { SearchBox } from '../components/SearchBox'
import { Pagination } from '../../catalog/components/Pagination'
import { ErrorAlert } from '../../../components/ui/Alert'
import { formatDateTime, formatNaira } from '../../../lib/format'
import { getErrorMessage } from '../../../services/api/apiError'

export function AdminCustomersPage() {
  const filters = useUrlFilters()
  const search = filters.get('q')
  const { data, isLoading, isFetching, error } = useAdminCustomers({ search, pageNumber: filters.page, pageSize: 20 })

  return (
    <div className="max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Customers</h1>
        <SearchBox initialValue={search} label="Search customers" placeholder="Name, email or phone" onSearch={(q) => filters.update({ q })} />
      </div>

      {error && <ErrorAlert>{getErrorMessage(error, 'Could not load customers.')}</ErrorAlert>}

      <section className={`overflow-hidden rounded-xl border border-border bg-white ${isFetching && !isLoading ? 'opacity-60' : ''}`}>
        {isLoading ? (
          <div className="h-40 animate-pulse" aria-busy="true" aria-label="Loading customers" />
        ) : !data || data.items.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-muted" aria-hidden />
            <p className="text-sm text-muted">No customers found.</p>
          </div>
        ) : (
          <>
            <p className="border-b border-border px-4 py-2 text-xs text-muted">{data.totalCount} customers</p>
            <ul className="divide-y divide-border">
              {data.items.map((customer) => (
                <li key={customer.id}>
                  <Link to={`/admin/customers/${customer.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light font-semibold text-primary">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{customer.name}</p>
                      <p className="truncate text-sm text-muted">
                        {customer.email}
                        {customer.phoneNumber ? ` · ${customer.phoneNumber}` : ''}
                      </p>
                    </div>
                    <div className="hidden text-right text-sm sm:block">
                      <p>
                        {customer.orderCount} {customer.orderCount === 1 ? 'order' : 'orders'} · {formatNaira(customer.totalSpent)}
                      </p>
                      <p className="text-xs text-muted">Joined {formatDateTime(customer.createdAt)}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {data && <Pagination page={data.pageNumber} totalPages={data.totalPages} onChange={(next) => filters.update({ page: next === 1 ? undefined : String(next) })} />}
    </div>
  )
}