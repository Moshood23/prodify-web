import type { ManagedProductStatus } from '../../../../types/sellerProduct'

const styles: Record<ManagedProductStatus, { label: string; className: string; title: string }> = {
  Live: { label: 'Live', className: 'bg-primary-light text-primary', title: 'Shoppers can see and buy this product.' },
  OutOfStock: { label: 'Out of stock', className: 'bg-accent-light text-accent-dark', title: 'Visible in the shop, but nothing left to sell.' },
  Incomplete: { label: 'Needs a variant', className: 'bg-slate-100 text-muted', title: 'Hidden until it has at least one active variant.' },
  Inactive: { label: 'Hidden', className: 'bg-red-50 text-danger', title: 'You have hidden this product from the shop.' },
}

export function ProductStatusBadge({ status }: { status: ManagedProductStatus }) {
  const { label, className, title } = styles[status]
  return (
    <span title={title} className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {label}
    </span>
  )
}