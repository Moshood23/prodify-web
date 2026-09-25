import { Link } from 'react-router-dom'
import { ClipboardList, Package, ShoppingBag, Store, Users, Wallet } from 'lucide-react'
import { useAdminDashboard } from '../hooks'
import { StatCard } from '../components/StatCard'
import { OrderStatusBadge } from '../../orders/components/OrderStatusBadge'
import { paymentStatusLabel } from '../../orders/orderLabels'
import { ErrorAlert } from '../../../components/ui/Alert'
import { formatDateTime, formatNaira } from '../../../lib/format'
import { getErrorMessage } from '../../../services/api/apiError'

export function AdminDashboardPage() {
  const { data, isLoading, error } = useAdminDashboard()

  if (error) return <ErrorAlert>{getErrorMessage(error, 'Could not load the dashboard.')}</ErrorAlert>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {isLoading || !data ? (
        <div className="grid animate-pulse gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-white" />
          ))}
        </div>
      ) : (
        <>
          {data.pendingSellers > 0 && (
            <Link
              to="/admin/sellers?status=PendingVerification"
              className="flex items-center justify-between gap-3 rounded-xl border border-accent bg-accent-light p-4 hover:bg-amber-100"
            >
              <span className="font-semibold text-accent-dark">
                {data.pendingSellers} seller {data.pendingSellers === 1 ? 'application is' : 'applications are'} waiting for review
              </span>
              <span className="text-sm font-semibold text-accent-dark">Review now →</span>
            </Link>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Sales received" value={formatNaira(data.paidSales)} icon={Wallet} hint="From paid orders" />
            <StatCard label="Orders" value={data.totalOrders} icon={ClipboardList} hint={`${data.ordersToday} today`} />
            <StatCard label="Customers" value={data.customers} icon={Users} />
            <StatCard
              label="Sellers waiting for review"
              value={data.pendingSellers}
              icon={Store}
              to="/admin/sellers?status=PendingVerification"
              highlight={data.pendingSellers > 0}
            />
            <StatCard
              label="Active sellers"
              value={data.approvedSellers}
              icon={ShoppingBag}
              hint={`${data.suspendedSellers} suspended`}
              to="/admin/sellers?status=Approved"
            />
            <StatCard label="Active products" value={data.activeProducts} icon={Package} />
          </div>

          <section className="rounded-xl border border-border bg-white">
            <h2 className="border-b border-border px-4 py-3 font-bold">Latest orders</h2>
            {data.recentOrders.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[40rem] text-left text-sm">
                  <thead className="bg-surface text-xs uppercase text-muted">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Order</th>
                      <th className="px-4 py-2 font-semibold">Customer</th>
                      <th className="px-4 py-2 font-semibold">Status</th>
                      <th className="px-4 py-2 font-semibold">Payment</th>
                      <th className="px-4 py-2 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-xs text-muted">{formatDateTime(order.createdAt)}</p>
                        </td>
                        <td className="px-4 py-3">{order.customerName}</td>
                        <td className="px-4 py-3">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3 text-muted">{paymentStatusLabel(order)}</td>
                        <td className="px-4 py-3 text-right font-semibold">{formatNaira(order.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}