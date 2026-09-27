import type { SellerOrderStatus } from '../../../types/sellerOrder'

// Sellers see what they need to do next; customers see where their package is.
const sellerLabels: Record<SellerOrderStatus, string> = {
  Pending: 'To confirm',
  Confirmed: 'To pack',
  Packed: 'To ship',
  Shipped: 'Shipped',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
}

const customerLabels: Record<SellerOrderStatus, string> = {
  Pending: 'Waiting for the seller',
  Confirmed: 'Confirmed by the seller',
  Packed: 'Packed',
  Shipped: 'On the way',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
}

const styles: Record<SellerOrderStatus, string> = {
  Pending: 'bg-accent-light text-accent-dark',
  Confirmed: 'bg-info/10 text-info',
  Packed: 'bg-info/10 text-info',
  Shipped: 'bg-primary-light text-primary',
  Delivered: 'bg-primary-light text-primary',
  Cancelled: 'bg-slate-100 text-muted',
}

export function SellerOrderStatusBadge({ status, forSeller = false }: { status: SellerOrderStatus; forSeller?: boolean }) {
  const label = (forSeller ? sellerLabels : customerLabels)[status] ?? status
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] ?? styles.Pending}`}>{label}</span>
}