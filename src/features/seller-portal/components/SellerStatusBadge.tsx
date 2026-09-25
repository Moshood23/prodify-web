import type { SellerStatus } from '../../../types/seller'

const styles: Record<SellerStatus, { label: string; className: string }> = {
  PendingVerification: { label: 'Pending review', className: 'bg-accent-light text-accent-dark' },
  Approved: { label: 'Approved', className: 'bg-primary-light text-primary' },
  Suspended: { label: 'Suspended', className: 'bg-red-50 text-danger' },
  Rejected: { label: 'Rejected', className: 'bg-slate-100 text-muted' },
}

export function SellerStatusBadge({ status }: { status: SellerStatus }) {
  const { label, className } = styles[status]
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>{label}</span>
}