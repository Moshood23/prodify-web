import { useState } from 'react'
import { Plus, Zap } from 'lucide-react'
import { useCancelFlashSale, useSellerFlashSales } from '../hooks'
import { FlashSaleListItem } from '../components/FlashSaleListItem'
import { NewFlashSaleForm } from '../components/NewFlashSaleForm'
import { FilterChips } from '../../admin/components/FilterChips'
import { Button } from '../../../components/ui/Button'
import { ErrorAlert } from '../../../components/ui/Alert'
import { useToastStore } from '../../../store/toastStore'
import { getErrorMessage } from '../../../services/api/apiError'
import type { FlashSale, FlashSaleFilter } from '../../../types/flashSale'

const filters: { value?: Exclude<FlashSaleFilter, undefined>; label: string }[] = [
  { label: 'All' },
  { value: 'pending', label: 'Waiting for approval' },
  { value: 'live', label: 'Live' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ended', label: 'Ended' },
]

function CancelButton({ sale }: { sale: FlashSale }) {
  const cancel = useCancelFlashSale()
  const showToast = useToastStore((s) => s.show)

  if (!['Pending', 'Upcoming', 'Live', 'SoldOut'].includes(sale.state)) return null

  return (
    <Button
      variant="outline"
      className="py-1.5"
      isLoading={cancel.isPending}
      onClick={() => {
        if (!window.confirm('Cancel this flash sale? Units already sold stay sold.')) return
        cancel.mutate(sale.id, {
          onSuccess: () => showToast({ kind: 'success', message: 'Flash sale cancelled' }),
          onError: (err) => showToast({ kind: 'error', message: getErrorMessage(err, 'Could not cancel the flash sale.') }),
        })
      }}
    >
      Cancel sale
    </Button>
  )
}

export function SellerFlashSalesPage() {
  const [state, setState] = useState<FlashSaleFilter>()
  const [showForm, setShowForm] = useState(false)
  const { data, isLoading, isFetching, error } = useSellerFlashSales(state)

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Flash sales</h1>
          <p className="text-sm text-muted">
            Put a product on sale for a few hours or days, with a limited number of units. Flash sales show on the home page and the Deals
            page.
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" aria-hidden /> New flash sale
          </Button>
        )}
      </div>

      {showForm && <NewFlashSaleForm onDone={() => setShowForm(false)} />}

      <FilterChips label="Flash sale status" options={filters} value={state} onChange={setState} />

      {error && <ErrorAlert>{getErrorMessage(error, 'Could not load your flash sales.')}</ErrorAlert>}

      <section className={`overflow-hidden rounded-xl border border-border bg-white ${isFetching && !isLoading ? 'opacity-60' : ''}`}>
        {isLoading ? (
          <div className="h-40 animate-pulse" aria-busy="true" aria-label="Loading flash sales" />
        ) : !data || data.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Zap className="mx-auto mb-3 h-10 w-10 text-muted" aria-hidden />
            <p className="text-sm text-muted">{state ? 'No flash sales here.' : 'You have not set up a flash sale yet.'}</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {data.map((sale) => (
              <FlashSaleListItem key={sale.id} sale={sale} actions={<CancelButton sale={sale} />} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
