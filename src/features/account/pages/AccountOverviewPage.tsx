import { Link } from 'react-router-dom'
import { ChevronRight, MapPin, Package, UserRound } from 'lucide-react'
import { useMe } from '../hooks'
import { useMyOrders } from '../../orders/hooks/useOrders'
import { OrderStatusBadge } from '../../orders/components/OrderStatusBadge'
import { ProductImage } from '../../catalog/components/ProductImage'
import { ErrorAlert } from '../../../components/ui/Alert'
import { formatDateTime, formatNaira } from '../../../lib/format'
import { getErrorMessage } from '../../../services/api/apiError'
import type { ReactNode } from 'react'

function Card({ title, icon, action, children }: { title: string; icon: ReactNode; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-white p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-bold">
          {icon}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function CardLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="flex items-center text-sm font-semibold text-primary hover:underline">
      {children} <ChevronRight className="h-4 w-4" aria-hidden />
    </Link>
  )
}

export function AccountOverviewPage() {
  const { data: me, isLoading, error } = useMe()
  const { data: orders } = useMyOrders(1)

  if (isLoading) return <div className="h-48 animate-pulse rounded-xl bg-white" aria-busy="true" aria-label="Loading account" />
  if (error || !me) return <ErrorAlert>{getErrorMessage(error, 'Could not load your account.')}</ErrorAlert>

  const defaultAddress = me.addresses.find((a) => a.isDefault) ?? me.addresses[0]
  const recentOrders = orders?.items.slice(0, 3) ?? []

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Hi, {me.firstName}</h1>

      <Card title="Recent orders" icon={<Package className="h-4 w-4 text-primary" aria-hidden />} action={<CardLink to="/orders">All orders</CardLink>}>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted">
            No orders yet.{' '}
            <Link to="/" className="font-semibold text-primary hover:underline">
              Start shopping
            </Link>
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {recentOrders.map((order) => (
              <li key={order.id}>
                <Link to={`/orders/${order.id}`} className="flex items-center gap-3 py-3 hover:text-primary">
                  <ProductImage src={order.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-md" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium">{order.summary}</p>
                    <p className="text-xs text-muted">{formatDateTime(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <OrderStatusBadge status={order.status} />
                    <p className="mt-1 text-sm font-semibold">{formatNaira(order.total)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Default address" icon={<MapPin className="h-4 w-4 text-primary" aria-hidden />} action={<CardLink to="/account/addresses">Manage</CardLink>}>
          {defaultAddress ? (
            <p className="text-sm">
              <span className="font-semibold">{defaultAddress.recipientName}</span>
              <br />
              {defaultAddress.addressLine1}, {defaultAddress.city}, {defaultAddress.state}
              <br />
              <span className="text-muted">{defaultAddress.phoneNumber}</span>
            </p>
          ) : (
            <p className="text-sm text-muted">You haven't saved an address yet.</p>
          )}
        </Card>

        <Card title="Profile" icon={<UserRound className="h-4 w-4 text-primary" aria-hidden />} action={<CardLink to="/account/profile">Edit</CardLink>}>
          <p className="text-sm">
            <span className="font-semibold">
              {me.firstName} {me.lastName}
            </span>
            <br />
            {me.email}
            <br />
            <span className="text-muted">{me.phoneNumber ?? 'No phone number'}</span>
          </p>
        </Card>
      </div>
    </div>
  )
}