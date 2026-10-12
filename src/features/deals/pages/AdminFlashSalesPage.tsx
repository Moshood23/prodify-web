import { useState } from 'react'
import { Zap } from 'lucide-react'
import { useAdminFlashSaleDecision, useAdminFlashSales } from '../hooks'
import { FlashSaleListItem } from '../components/FlashSaleListItem'
import { ReasonButton } from '../components/ReasonButton'
import { FilterChips } from '../../admin/components/FilterChips'
import { Button } from '../../../components/ui/Button'
import { ErrorAlert } from '../../../components/ui/Alert'
import { useToastStore } from '../../../store/toastStore'
import { getErrorMessage } from '../../../services/api/apiError'
import type { FlashSale, FlashSaleFilter } from '../../../types/flashSale'

const filters: { value?: Exclude<FlashSaleFilter, undefined>; label: string }[] = [
  { value: 'pending', label: 'Waiting for approval' },
  { value: 'live', label: 'Live' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ended', label: 'Ended' },
  { label: 'All' },
]

function AdminActions({ sale }: { sale: FlashSale }) {
  const decide = useAdminFlashSaleDecision()
  const showToast = useToastStore((s) => s.show)
  const onError = (err: unknown) => showToast({ kind: 'error', message: getErrorMessage(err, 'Could not update the flash sale.') })

  if (sale.state === 'Pending') {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          className="py-1.5"
          isLoading={decide.isPending && decide.variables?.action === 'approve'}
          disabled={decide.isPending}
          onClick={() =>
            decide.mutate(
              { id: sale.id, action: 'approve' },
              { onSuccess: () => showToast({ kind: 'success', message: 'Flash sale approved' }), onError },
            )
          }
        >
          Approve
        </Button>
        <ReasonButton
          label="Reject"
          question="Why are you rejecting it?"
          placeholder="e.g. The discount isn't real"
          isPending={decide.isPending}
          onConfirm={(note, done) =>
            decide.mutate(
              { id: sale.id, action: 'reject', note },
              { onSuccess: () => showToast({ kind: 'success', message: 'Flash sale rejected' }), onError: done.onError },
            )
          }
        />
      </div>
    )
  }

  if (['Upcoming', 'Live', 'SoldOut'].includes(sale.state)) {
    return (
      <ReasonButton
        label="Stop sale"
        question="Why are you stopping it?"
        placeholder="e.g. Customer complaints"
        isPending={decide.isPending}
        onConfirm={(note, done) =>
          decide.mutate(
            { id: sale.id, action: 'stop', note },
            { onSuccess: () => showToast({ kind: 'success', message: 'Flash sale stopped' }), onError: done.onError },
          )
        }
      />
    )
  }

  return null
}

export function AdminFlashSalesPage() {
  const [state, setState] = useState<FlashSaleFilter>('pending')
  const { data, isLoading, isFetching, error } = useAdminFlashSales(state)

  return (
    <div className="max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Flash sales</h1>
        <p className="text-sm text-muted">
          Sellers set these up; they only go live once approved. Check the discount is real and the product is fine to promote.
        </p>
      </div>

      <FilterChips label="Flash sale status" options={filters} value={state} onChange={setState} />

      {error && <ErrorAlert>{getErrorMessage(error, 'Could not load flash sales.')}</ErrorAlert>}

      <section className={`overflow-hidden rounded-xl border border-border bg-white ${isFetching && !isLoading ? 'opacity-60' : ''}`}>
        {isLoading ? (
          <div className="h-40 animate-pulse" aria-busy="true" aria-label="Loading flash sales" />
        ) : !data || data.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Zap className="mx-auto mb-3 h-10 w-10 text-muted" aria-hidden />
            <p className="text-sm text-muted">{state === 'pending' ? 'No flash sales waiting for approval.' : 'No flash sales here.'}</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {data.map((sale) => (
              <FlashSaleListItem key={sale.id} sale={sale} showSeller actions={<AdminActions sale={sale} />} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
