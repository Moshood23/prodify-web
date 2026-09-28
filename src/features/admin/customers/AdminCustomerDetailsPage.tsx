import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ClipboardList, Wallet, XCircle } from 'lucide-react'
import { useAdminCustomer, useAdminOrders } from '../hooks'
import { StatCard } from '../components/StatCard'
import { AdminOrderRows } from '../orders/AdminOrderRows'
import { Pagination } from '../../catalog/components/Pagination'
import { ErrorAlert } from '../../../components/ui/Alert'
import { formatDateTime, formatNaira } from '../../../lib/format'
import { getErrorMessage, getErrorStatus } from '../../../services/api/apiError'

function CustomerOrders({ customerId }: { customerId: string }) {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAdminOrders({ customerId, pageNumber: page, pageSize: 10 })

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-white">
      <h2 className="border-b border-border px-4 py-3 font-bold">Orders</h2>
      {isLoading ? (
        <div className="h-24 animate-pulse" aria-busy="true" aria-label="Loading orders" />
      ) : !data || data.items.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted">No orders yet.</p>
      ) : (
        <AdminOrderRows orders={data.items} showCustomer={false} />
      )}
      {data && data.totalPages > 1 && (
        <div className="border-t border-border p-3">
          <Pagination page={data.pageNumber} totalPages={data.totalPages} onChange={setPage} />
        </div>
      )}
    </section>
  )
}

export function AdminCustomerDetailsPage() {
  const { customerId } = useParams()
  const { data: customer, isLoading, error } = useAdminCustomer(customerId)

  if (isLoading) return <div className="h-48 animate-pulse rounded-xl bg-white" aria-busy="true" aria-label="Loading customer" />
  if (error || !customer) {
    return <ErrorAlert>{getErrorStatus(error) === 404 ? 'Customer not found.' : getErrorMessage(error, 'Could not load this customer.')}</ErrorAlert>
  }

  return (
    <div className="max-w-5xl space-y-5">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link to="/admin/customers" className="hover:text-primary">
          Customers
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">
          {customer.firstName} {customer.lastName}
        </span>
      </nav>

      <header>
        <h1 className="text-2xl font-bold">
          {customer.firstName} {customer.lastName}
        </h1>
        <p className="text-sm text-muted">
          {customer.email}
          {customer.phoneNumber ? ` · ${customer.phoneNumber}` : ''} · Joined {formatDateTime(customer.createdAt)}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Orders" value={customer.orderCount} icon={ClipboardList} />
        <StatCard label="Cancelled" value={customer.cancelledOrderCount} icon={XCircle} />
        <StatCard label="Spent" value={formatNaira(customer.totalSpent)} icon={Wallet} hint="Paid orders" />
      </div>

      <CustomerOrders customerId={customer.id} />

      <section className="rounded-xl border border-border bg-white p-4">
        <h2 className="mb-3 font-bold">Saved addresses</h2>
        {customer.addresses.length === 0 ? (
          <p className="text-sm text-muted">No saved addresses.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {customer.addresses.map((address, index) => (
              <li key={index} className="rounded-lg border border-border p-3 text-sm">
                <p className="font-semibold">
                  {address.label} {address.isDefault && <span className="ml-1 rounded-full bg-primary-light px-2 py-0.5 text-xs text-primary">Default</span>}
                </p>
                <p>{address.recipientName}</p>
                <p>
                  {address.addressLine1}, {address.city}, {address.state}
                </p>
                <p className="text-muted">{address.phoneNumber}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}