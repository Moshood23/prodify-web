import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { useSellerReturnDecision, useSellerReturns } from '../hooks'
import { ReturnListItem } from '../components/ReturnListItem'
import { DecisionButtons } from '../components/DecisionButtons'
import { FilterChips } from '../../admin/components/FilterChips'
import { ErrorAlert } from '../../../components/ui/Alert'
import { useToastStore } from '../../../store/toastStore'
import { getErrorMessage } from '../../../services/api/apiError'
import type { ReturnRequest } from '../../../types/returns'
import type { ReturnFilter } from '../returnsApi'

const filters: { value?: 'open'; label: string }[] = [{ value: 'open', label: 'Waiting' }, { label: 'All' }]

function SellerDecision({ request }: { request: ReturnRequest }) {
  const decide = useSellerReturnDecision()
  const showToast = useToastStore((s) => s.show)

  if (request.status !== 'Requested') return null

  return (
    <DecisionButtons
      yesLabel="Accept and refund"
      noLabel="Reject"
      noNote="Why are you rejecting it?"
      noPlaceholder="e.g. The item was used"
      isPending={decide.isPending}
      onDecide={(accept, note, { onError }) =>
        decide.mutate(
          { id: request.id, accept, note },
          {
            onSuccess: () =>
              showToast({ kind: 'success', message: accept ? 'Return accepted. The customer has been refunded.' : 'Return rejected' }),
            onError,
          },
        )
      }
    />
  )
}

export function SellerReturnsPage() {
  const [status, setStatus] = useState<ReturnFilter>('open')
  const { data, isLoading, isFetching, error } = useSellerReturns(status)

  return (
    <div className="max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Returns</h1>
        <p className="text-sm text-muted">
          Customers can ask to return items within 7 days of delivery. Accepting refunds them and takes the items off your earnings. If you
          reject, the customer can ask Prodify to decide.
        </p>
      </div>

      <FilterChips label="Return status" options={filters} value={status === 'open' ? 'open' : undefined} onChange={setStatus} />

      {error && <ErrorAlert>{getErrorMessage(error, 'Could not load returns.')}</ErrorAlert>}

      <section className={`overflow-hidden rounded-xl border border-border bg-white ${isFetching && !isLoading ? 'opacity-60' : ''}`}>
        {isLoading ? (
          <div className="h-40 animate-pulse" aria-busy="true" aria-label="Loading returns" />
        ) : !data || data.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <RotateCcw className="mx-auto mb-3 h-10 w-10 text-muted" aria-hidden />
            <p className="text-sm text-muted">{status === 'open' ? 'No returns waiting for you.' : 'No returns yet.'}</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {data.map((r) => (
              <ReturnListItem key={r.id} request={r} who={r.customerName} actions={<SellerDecision request={r} />} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
