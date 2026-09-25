import type { OrderStatus } from '../../../types/order'

const statusStyles: Record<OrderStatus, { label: string; className: string }> = {
  Pending: { label: 'Order placed', className: 'bg-info/10 text-info' },
  Confirmed: { label: 'Confirmed', className: 'bg-info/10 text-info' },
  PartiallyShipped: { label: 'Partly shipped', className: 'bg-accent-light text-accent-dark' },
  Shipped: { label: 'Shipped', className: 'bg-accent-light text-accent-dark' },
  PartiallyDelivered: { label: 'Partly delivered', className: 'bg-primary-light text-primary' },
  Delivered: { label: 'Delivered', className: 'bg-primary-light text-primary' },
  Cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-muted' },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = statusStyles[status] ?? statusStyles.Pending
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>{label}</span>
}