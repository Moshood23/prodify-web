import { reasonLabels } from '../returnLabels'
import { formatNaira } from '../../../lib/format'
import type { ReturnRequest } from '../../../types/returns'

// What is being returned and why, and what everyone has said about it.
export function ReturnSummary({ request }: { request: ReturnRequest }) {
  const refunded = request.refundedToCard + request.refundedAsCredit

  return (
    <div className="space-y-2 text-sm">
      <ul className="space-y-1">
        {request.items.map((item) => (
          <li key={item.productVariantId} className="flex justify-between gap-3">
            <span className="min-w-0">
              {item.productName} <span className="text-muted">x {item.quantity}</span>
            </span>
            <span className="shrink-0">{formatNaira(item.unitPrice * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <p>
        <span className="font-semibold">Reason:</span> {reasonLabels[request.reason]}
        {request.details && <span className="text-muted"> &ldquo;{request.details}&rdquo;</span>}
      </p>
      {request.sellerNote && (
        <p>
          <span className="font-semibold">Seller:</span> {request.sellerNote}
        </p>
      )}
      {request.customerNote && (
        <p>
          <span className="font-semibold">Customer asked Prodify:</span> {request.customerNote}
        </p>
      )}
      {request.adminNote && (
        <p>
          <span className="font-semibold">Prodify:</span> {request.adminNote}
        </p>
      )}
      {request.status === 'Refunded' ? (
        <p className="font-semibold text-success">
          Refunded {formatNaira(refunded)}
          {request.refundedToCard > 0 && request.refundedAsCredit > 0
            ? ` (${formatNaira(request.refundedToCard)} to card, ${formatNaira(request.refundedAsCredit)} as store credit)`
            : request.refundedAsCredit > 0
              ? ' as store credit'
              : ' to card'}
        </p>
      ) : (
        <p className="text-muted">
          Refund if accepted: <span className="font-semibold text-ink">{formatNaira(request.refundAmount)}</span>
        </p>
      )}
    </div>
  )
}
