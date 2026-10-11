import { statusStyles } from '../returnLabels'
import type { ReturnStatus } from '../../../types/returns'

export function ReturnStatusBadge({ status }: { status: ReturnStatus }) {
  const { label, className } = statusStyles[status]
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>{label}</span>
}
