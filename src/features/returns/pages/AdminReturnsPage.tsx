import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { useAdminReturnDecision, useAdminReturns } from '../hooks'
import { ReturnListItem } from '../components/ReturnListItem'
import { DecisionButtons } from '../components/DecisionButtons'
import { FilterChips } from '../../admin/components/FilterChips'
import { ErrorAlert } from '../../../components/ui/Alert'
import { useToastStore } from '../../../store/toastStore'
import { getErrorMessage } from '../../../services/api/apiError'
import type { ReturnRequest } from '../../../types/returns'
import type { ReturnFilter } from '../returnsApi'

type Filter = Exclude<ReturnFilter, undefined> | 'all'

const filters: { value: Filter; label: string }[] = [
  { value: 'Escalated', label: 'Sent to Prodify' },
  { value: 'open', label: 'All waiting' },
  { value: 'all', label: 'All' },
]

function AdminDecision({ request }: { request: ReturnRequest }) {
  const decide = useAdminReturnDecision()
  const showToast = useToastStore((s) => s.show)

  if (request.status !== 'Requested' && request.status !== 'Escalated') return null

  return (
    <DecisionButtons
      yesLabel="Approve and refund"
      noLabel="Decline"
      yesNote="Note for the customer"
      noNote="Why is it declined?"
      noPlaceholder="e.g. Photos show the item was used"
      isPending={decide.isPending}
      onDecide={(approve, note, { onError }) =>
        decide.mutate(
          { id: request.id, approve, note },
          {
            onSuccess: () => showToast({ kind: 'success', message: approve ? 'Return approved and refunded' : 'Return declined' }),
            onError,
          },
        )
      }
    />
  )
}

export function AdminReturnsPage() {
  const [filter, setFilter] = useState<Filter>('Escalated')
  const { data, isLoading, isFetching, error } = useAdminReturns(filter === 'all' ? undefined : filter)

  return (
    <div className="max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Returns</h1>
        <p className="text-sm text-muted">
          Sellers answer returns first. When a seller says no, the customer can send it here, and your decision is final.
        </p>
      </div>

      <FilterChips label="Return status" options={filters} value={filter} onChange={(value) => setFilter(value ?? 'all')} />

      {error && <ErrorAlert>{getErrorMessage(error, 'Could not load returns.')}</ErrorAlert>}

      <section className={`overflow-hidden rounded-xl border border-border bg-white ${isFetching && !isLoading ? 'opacity-60' : ''}`}>
        {isLoading ? (
          <div className="h-40 animate-pulse" aria-busy="true" aria-label="Loading returns" />
        ) : !data || data.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <RotateCcw className="mx-auto mb-3 h-10 w-10 text-muted" aria-hidden />
            <p className="text-sm text-muted">{filter === 'all' ? 'No returns yet.' : 'Nothing waiting. All caught up.'}</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {data.map((r) => (
              <ReturnListItem
                key={r.id}
                request={r}
                who={`${r.customerName} from ${r.sellerName}`}
                actions={<AdminDecision request={r} />}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
