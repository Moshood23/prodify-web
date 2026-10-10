import { Link } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { useStoreCredit } from '../hooks'
import { ErrorAlert } from '../../../components/ui/Alert'
import { formatDateTime, formatNaira } from '../../../lib/format'
import { getErrorMessage } from '../../../services/api/apiError'

export function StoreCreditPage() {
  const { data, isLoading, error } = useStoreCredit()

  if (isLoading) return <div className="h-48 animate-pulse rounded-xl bg-white" aria-busy="true" aria-label="Loading store credit" />
  if (error || !data) return <ErrorAlert>{getErrorMessage(error, 'Could not load your store credit.')}</ErrorAlert>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Store credit</h1>

      <section className="flex items-center gap-4 rounded-xl border border-border bg-white p-4 sm:p-6">
        <span className="rounded-full bg-primary-light p-3">
          <Wallet className="h-6 w-6 text-primary" aria-hidden />
        </span>
        <div>
          <p className="text-sm text-muted">Available to spend</p>
          <p className="text-2xl font-bold">{formatNaira(data.balance)}</p>
        </div>
      </section>

      <p className="text-sm text-muted">
        Refunds for orders paid with cash, or paid with store credit, come back here. Tick "Use my store credit" at checkout to spend it.
      </p>

      <section className="rounded-xl border border-border bg-white p-4 sm:p-6">
        <h2 className="mb-2 font-bold">History</h2>
        {data.entries.length === 0 ? (
          <p className="text-sm text-muted">No store credit yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {data.entries.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  {entry.orderId ? (
                    <Link to={`/orders/${entry.orderId}`} className="font-medium hover:text-primary">
                      {entry.description}
                    </Link>
                  ) : (
                    <p className="font-medium">{entry.description}</p>
                  )}
                  <p className="text-xs text-muted">{formatDateTime(entry.createdAt)}</p>
                </div>
                <p className={`shrink-0 font-semibold ${entry.amount > 0 ? 'text-success' : ''}`}>
                  {entry.amount > 0 ? '+' : '-'}
                  {formatNaira(Math.abs(entry.amount))}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
