import { Loader2 } from 'lucide-react'
import type { usePaystackReturn } from '../hooks/useOrders'
import { ErrorAlert } from '../../../components/ui/Alert'
import { getErrorMessage } from '../../../services/api/apiError'

// Shown when Paystack sends the customer back to the order page with ?reference=...
export function PaystackReturn({ check }: { check: ReturnType<typeof usePaystackReturn> }) {
  const { data, error, isFetching, refetch, stoppedChecking } = check

  if (error) return <ErrorAlert>{getErrorMessage(error, "We couldn't check your payment with Paystack.")}</ErrorAlert>

  // Paid: the "Payment received" banner above says it.
  if (data?.status === 'Paid') return null

  if (data?.status === 'Failed') {
    return (
      <ErrorAlert>
        Your payment didn't go through{data.message ? ` (${data.message})` : ''}. No money was taken; you can try again below.
      </ErrorAlert>
    )
  }

  if (data?.status === 'Refunded') {
    return (
      <p role="status" className="rounded-xl border border-accent bg-accent-light px-4 py-3 text-sm text-accent-dark">
        {data.message}
      </p>
    )
  }

  if (stoppedChecking) {
    return (
      <div
        role="status"
        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm"
      >
        <span>Paystack hasn't confirmed this payment yet. If you paid, it will show here within a few minutes.</span>
        <button
          onClick={() => void refetch()}
          disabled={isFetching}
          className="font-semibold text-primary hover:underline disabled:opacity-60"
        >
          {isFetching ? 'Checking...' : 'Check again'}
        </button>
      </div>
    )
  }

  return (
    <p role="status" className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm">
      <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden /> Checking your payment with Paystack...
    </p>
  )
}
