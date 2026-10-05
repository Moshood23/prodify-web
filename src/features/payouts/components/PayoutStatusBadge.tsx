import type { PayoutStatus } from '../../../types/payout'

const styles: Record<PayoutStatus, { label: string; className: string }> = {
  Requested: { label: 'Waiting to be paid', className: 'bg-accent-light text-accent-dark' },
  Paid: { label: 'Paid', className: 'bg-primary-light text-primary' },
  Rejected: { label: 'Not paid', className: 'bg-red-50 text-danger' },
}

export function PayoutStatusBadge({ status }: { status: PayoutStatus }) {
  const { label, className } = styles[status]
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>{label}</span>
}
