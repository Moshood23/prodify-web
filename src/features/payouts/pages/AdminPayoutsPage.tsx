import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Banknote } from 'lucide-react'
import { useAdminPayouts, useProcessPayout } from '../hooks'
import { PayoutStatusBadge } from '../components/PayoutStatusBadge'
import { useUrlFilters } from '../../admin/useUrlFilters'
import { FilterChips } from '../../admin/components/FilterChips'
import { SearchBox } from '../../admin/components/SearchBox'
import { Pagination } from '../../catalog/components/Pagination'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'
import { ErrorAlert } from '../../../components/ui/Alert'
import { useToastStore } from '../../../store/toastStore'
import { formatDateTime, formatNaira } from '../../../lib/format'
import { getErrorMessage, getFieldErrors } from '../../../services/api/apiError'
import type { AdminPayout, PayoutStatus } from '../../../types/payout'

const statuses: { value?: PayoutStatus; label: string }[] = [
  { value: 'Requested', label: 'Waiting' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Rejected', label: 'Rejected' },
  { label: 'All' },
]

// "Mark paid" asks for the bank reference; "Reject" asks for a reason the seller will see.
function PayoutActions({ payout }: { payout: AdminPayout }) {
  const [mode, setMode] = useState<'pay' | 'reject' | null>(null)
  const [text, setText] = useState('')
  const [error, setError] = useState<string>()
  const process = useProcessPayout()
  const showToast = useToastStore((s) => s.show)

  if (payout.status !== 'Requested') return null

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!text.trim()) {
      setError(mode === 'pay' ? 'Enter the bank transfer reference.' : 'Say why. The seller will see this.')
      return
    }
    process.mutate(
      { id: payout.id, paid: mode === 'pay', text: text.trim() },
      {
        onSuccess: () =>
          showToast({ kind: 'success', message: mode === 'pay' ? `${payout.sellerName} marked as paid` : `Payout to ${payout.sellerName} rejected` }),
        onError: (err) => setError(Object.values(getFieldErrors(err))[0]?.[0] ?? getErrorMessage(err)),
      },
    )
  }

  if (!mode) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button className="py-1.5" onClick={() => setMode('pay')}>
          Mark paid
        </Button>
        <Button variant="outline" className="py-1.5" onClick={() => setMode('reject')}>
          Reject
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className={`flex w-full flex-wrap items-start gap-2 rounded-lg p-3 ${mode === 'pay' ? 'bg-primary-light/40' : 'bg-red-50'}`}>
      <TextField
        label={mode === 'pay' ? 'Bank transfer reference' : 'Why is it rejected?'}
        placeholder={mode === 'pay' ? 'e.g. GTB-TRF-102938' : 'e.g. Account name does not match the store'}
        maxLength={mode === 'pay' ? 100 : 500}
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setError(undefined)
        }}
        error={error}
        className="min-w-0 flex-1"
        autoFocus
      />
      <div className="flex gap-2 sm:mt-6">
        <Button type="submit" variant={mode === 'pay' ? 'primary' : 'danger'} isLoading={process.isPending}>
          {mode === 'pay' ? 'Confirm paid' : 'Reject payout'}
        </Button>
        <Button type="button" variant="outline" onClick={() => setMode(null)} disabled={process.isPending}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export function AdminPayoutsPage() {
  const filters = useUrlFilters()
  const search = filters.get('q')
  // Waiting requests are the default view: they're what needs doing.
  const statusParam = filters.get('status')
  const status = statusParam === 'all' ? undefined : ((statusParam as PayoutStatus | undefined) ?? 'Requested')
  const { data, isLoading, isFetching, error } = useAdminPayouts({ status, search, pageNumber: filters.page, pageSize: 20 })

  return (
    <div className="max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Payouts</h1>
          <p className="text-sm text-muted">Send the money by bank transfer, then mark the request paid with the reference.</p>
        </div>
        <SearchBox initialValue={search} label="Search payouts" placeholder="Store or account name" onSearch={(q) => filters.update({ q })} />
      </div>

      <FilterChips
        label="Payout status"
        options={statuses}
        value={status}
        onChange={(value) => filters.update({ status: value === 'Requested' ? undefined : (value ?? 'all') })}
      />

      {error && <ErrorAlert>{getErrorMessage(error, 'Could not load payouts.')}</ErrorAlert>}

      <section className={`overflow-hidden rounded-xl border border-border bg-white ${isFetching && !isLoading ? 'opacity-60' : ''}`}>
        {isLoading ? (
          <div className="h-40 animate-pulse" aria-busy="true" aria-label="Loading payouts" />
        ) : !data || data.items.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Banknote className="mx-auto mb-3 h-10 w-10 text-muted" aria-hidden />
            <p className="text-sm text-muted">{status === 'Requested' ? 'No payouts waiting. All caught up.' : 'No payouts found.'}</p>
          </div>
        ) : (
          <>
            <p className="border-b border-border px-4 py-2 text-xs text-muted">{data.totalCount} payouts</p>
            <ul className="divide-y divide-border">
              {data.items.map((p) => (
                <li key={p.id} className="space-y-2 px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link to={`/admin/sellers/${p.sellerId}`} className="font-semibold hover:text-primary">
                        {p.sellerName}
                      </Link>
                      <p className="text-xs text-muted">Requested {formatDateTime(p.requestedAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatNaira(p.amount)}</p>
                      <PayoutStatusBadge status={p.status} />
                    </div>
                  </div>
                  <p className="rounded-md bg-surface px-3 py-2 text-sm">
                    {p.bankName} &middot; <span className="font-semibold tabular-nums">{p.accountNumber}</span> &middot; {p.accountName}
                  </p>
                  {p.reference && <p className="text-xs text-muted">Bank reference: {p.reference}</p>}
                  {p.rejectReason && <p className="text-xs text-danger">Rejected: {p.rejectReason}</p>}
                  <PayoutActions payout={p} />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {data && <Pagination page={data.pageNumber} totalPages={data.totalPages} onChange={(next) => filters.update({ page: next === 1 ? undefined : String(next) })} />}
    </div>
  )
}