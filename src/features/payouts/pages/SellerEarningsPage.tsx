import { Link } from 'react-router-dom'
import { CheckCircle2, Clock, Hourglass, Wallet } from 'lucide-react'
import { useEarnings } from '../hooks'
import { PayoutAccountCard } from '../components/PayoutAccountCard'
import { RequestPayoutCard } from '../components/RequestPayoutCard'
import { PayoutStatusBadge } from '../components/PayoutStatusBadge'
import { StatCard } from '../../admin/components/StatCard'
import { ErrorAlert } from '../../../components/ui/Alert'
import { formatDate, formatNaira } from '../../../lib/format'
import { getErrorMessage } from '../../../services/api/apiError'
import type { Earning, Payout } from '../../../types/payout'

function PayoutHistory({ payouts }: { payouts: Payout[] }) {
  return (
    <section className="rounded-xl border border-border bg-white">
      <h2 className="border-b border-border px-4 py-3 font-bold sm:px-5">Payouts</h2>
      {payouts.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted sm:px-5">No payouts yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {payouts.map((p) => (
            <li key={p.id} className="flex flex-wrap items-start justify-between gap-2 px-4 py-3 text-sm sm:px-5">
              <div className="min-w-0">
                <p className="font-semibold">{formatNaira(p.amount)}</p>
                <p className="text-xs text-muted">
                  Requested {formatDate(p.requestedAt)} &middot; {p.bankName} {p.accountNumber}
                </p>
                {p.reference && <p className="text-xs text-muted">Bank reference: {p.reference}</p>}
                {p.rejectReason && <p className="text-xs text-danger">{p.rejectReason}</p>}
              </div>
              <PayoutStatusBadge status={p.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function EarningsList({ earnings, holdDays }: { earnings: Earning[]; holdDays: number }) {
  return (
    <section className="rounded-xl border border-border bg-white">
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <h2 className="font-bold">Recent earnings</h2>
        <p className="text-xs text-muted">One line per delivered order. Money is ready {holdDays} days after delivery.</p>
      </div>
      {earnings.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted sm:px-5">Earnings appear here when your orders are delivered.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-sm">
            <thead className="text-left text-xs text-muted">
              <tr>
                <th className="px-4 py-2 font-medium sm:px-5">Order</th>
                <th className="px-2 py-2 text-right font-medium">Sales</th>
                <th className="px-2 py-2 text-right font-medium">Commission</th>
                <th className="px-2 py-2 text-right font-medium">You get</th>
                <th className="px-4 py-2 text-right font-medium sm:px-5">Ready</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {earnings.map((e) => (
                <tr key={e.sellerOrderId}>
                  <td className="px-4 py-2 sm:px-5">
                    <Link to={`/seller/orders/${e.sellerOrderId}`} className="font-medium text-primary hover:underline">
                      {e.orderNumber}
                    </Link>
                    <p className="text-xs text-muted">Delivered {formatDate(e.earnedAt)}</p>
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums">{formatNaira(e.sales)}</td>
                  <td className="px-2 py-2 text-right tabular-nums text-muted">
                    -{formatNaira(e.commission)} <span className="text-xs">({e.commissionRate}%)</span>
                  </td>
                  <td className="px-2 py-2 text-right font-semibold tabular-nums">{formatNaira(e.netAmount)}</td>
                  <td className="px-4 py-2 text-right text-xs sm:px-5">
                    {e.isAvailable ? (
                      <span className="font-semibold text-success">Ready</span>
                    ) : (
                      <span className="text-muted">{formatDate(e.availableAt)}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export function SellerEarningsPage() {
  const { data, isLoading, error } = useEarnings()

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl bg-white" aria-busy="true" aria-label="Loading earnings" />
  if (error || !data) return <ErrorAlert>{getErrorMessage(error, 'Could not load your earnings.')}</ErrorAlert>

  return (
    <div className="max-w-5xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Earnings</h1>
        <p className="text-sm text-muted">
          Prodify keeps {data.commissionRate}% of each sale. Your share is ready to withdraw {data.holdDays} days after an order is
          delivered.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ready to withdraw" value={formatNaira(data.available)} icon={Wallet} highlight />
        <StatCard label={`On hold (${data.holdDays} days)`} value={formatNaira(data.onHold)} icon={Hourglass} hint="Delivered recently" />
        <StatCard label="Being paid" value={formatNaira(data.inProgress)} icon={Clock} hint="Requested, not yet sent" />
        <StatCard
          label="Paid to you"
          value={formatNaira(data.paidOut)}
          icon={CheckCircle2}
          hint={`Earned so far: ${formatNaira(data.totalEarned)}`}
        />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <RequestPayoutCard key={data.available} earnings={data} />
        <PayoutAccountCard account={data.account} />
      </div>

      <PayoutHistory payouts={data.payouts} />
      <EarningsList earnings={data.recentEarnings} holdDays={data.holdDays} />
    </div>
  )
}