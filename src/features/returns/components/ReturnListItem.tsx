import type { ReactNode } from 'react'
import { ReturnStatusBadge } from './ReturnStatusBadge'
import { ReturnSummary } from './ReturnSummary'
import { formatDateTime } from '../../../lib/format'
import type { ReturnRequest } from '../../../types/returns'

// One return in a seller's or admin's list; `who` is the other party, `actions` the buttons.
export function ReturnListItem({ request, who, actions }: { request: ReturnRequest; who: ReactNode; actions?: ReactNode }) {
  return (
    <li className="space-y-3 px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold">Order {request.orderNumber}</p>
          <p className="text-xs text-muted">
            {who} &middot; asked {formatDateTime(request.createdAt)} &middot;{' '}
            {request.paymentMethod === 'Card' ? 'paid by card' : 'paid on delivery'}
          </p>
        </div>
        <ReturnStatusBadge status={request.status} />
      </div>
      <ReturnSummary request={request} />
      {actions}
    </li>
  )
}
