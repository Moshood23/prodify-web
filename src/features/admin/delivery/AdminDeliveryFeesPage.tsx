import { useState } from 'react'
import { Search, Truck } from 'lucide-react'
import { useDeliveryFees } from '../../checkout/useDeliveryFees'
import { useUpdateDeliveryFee } from '../hooks'
import { Button } from '../../../components/ui/Button'
import { ErrorAlert } from '../../../components/ui/Alert'
import { useToastStore } from '../../../store/toastStore'
import { getErrorMessage } from '../../../services/api/apiError'
import { formatNaira } from '../../../lib/format'
import type { DeliveryFee } from '../../../types/order'

const MAX_FEE = 100_000
const NAIRA = '\u20A6'

function FeeRow({ fee }: { fee: DeliveryFee }) {
  const [value, setValue] = useState(String(fee.fee))
  const update = useUpdateDeliveryFee()
  const showToast = useToastStore((s) => s.show)

  const amount = Number(value)
  const invalid = value.trim() === '' || !Number.isFinite(amount) || amount < 0 || amount > MAX_FEE
  const changed = !invalid && amount !== fee.fee

  function save() {
    if (!changed) return
    update.mutate(
      { state: fee.state, fee: amount },
      {
        onSuccess: () => showToast({ kind: 'success', message: `Delivery to ${fee.state} is now ${amount === 0 ? 'free' : formatNaira(amount)}` }),
        onError: (e) => showToast({ kind: 'error', message: getErrorMessage(e, 'Could not save the fee.') }),
      },
    )
  }

  return (
    <li className="flex flex-wrap items-center gap-3 py-2.5">
      <label htmlFor={`fee-${fee.state}`} className="min-w-0 flex-1 text-sm font-medium">
        {fee.state}
      </label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">{NAIRA}</span>
          <input
            id={`fee-${fee.state}`}
            type="number"
            inputMode="numeric"
            min={0}
            max={MAX_FEE}
            step={100}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            aria-invalid={invalid}
            className={`w-32 rounded-lg border bg-white py-2 pl-7 pr-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
              invalid ? 'border-danger' : 'border-border'
            }`}
          />
        </div>
        <Button variant="outline" className="px-3 py-2" disabled={!changed} isLoading={update.isPending} onClick={save}>
          Save
        </Button>
      </div>
      {invalid && <p className="w-full text-right text-xs text-danger">Enter an amount from {formatNaira(0)} to {formatNaira(MAX_FEE)}.</p>}
    </li>
  )
}

export function AdminDeliveryFeesPage() {
  const { data: fees, isLoading, error } = useDeliveryFees()
  const [search, setSearch] = useState('')

  const shown = (fees ?? []).filter((f) => f.state.toLowerCase().includes(search.trim().toLowerCase()))

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Truck className="h-6 w-6 text-primary" aria-hidden /> Delivery fees
        </h1>
        <p className="text-sm text-muted">
          What customers pay for delivery to each state. Changes apply to new orders only. Use {formatNaira(0)} for free delivery.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-white p-4">
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find a state"
            aria-label="Find a state"
            className="w-full rounded-lg border border-border bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {isLoading && <div className="h-64 animate-pulse rounded-lg bg-slate-100" aria-busy="true" aria-label="Loading fees" />}
        {error && <ErrorAlert>{getErrorMessage(error, 'Could not load the delivery fees.')}</ErrorAlert>}
        {fees && shown.length === 0 && <p className="py-6 text-center text-sm text-muted">No state matches "{search}".</p>}

        <ul className="divide-y divide-border">
          {shown.map((fee) => (
            // Remounts after a save so the box shows the saved amount.
            <FeeRow key={`${fee.state}-${fee.fee}`} fee={fee} />
          ))}
        </ul>
      </section>
    </div>
  )
}
