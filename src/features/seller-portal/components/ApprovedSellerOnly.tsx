import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useMySeller } from '../hooks'
import { ErrorAlert } from '../../../components/ui/Alert'
import { getErrorMessage } from '../../../services/api/apiError'

const messages = {
  PendingVerification: 'You can add products once Prodify approves your store.',
  Rejected: 'Your application was not approved. Update it from the dashboard and apply again.',
  Suspended: 'Your store is suspended, so its products are hidden and cannot be changed.',
}

// Seller Centre pages that only an approved store can use.
export function ApprovedSellerOnly({ children }: { children: ReactNode }) {
  const { data: seller, isLoading, error } = useMySeller()

  if (isLoading) return <div className="h-40 animate-pulse rounded-xl bg-white" aria-busy="true" aria-label="Loading" />
  if (error || !seller) return <ErrorAlert>{getErrorMessage(error, 'Could not load your store.')}</ErrorAlert>

  if (seller.status !== 'Approved') {
    return (
      <div className="max-w-xl rounded-xl border border-border bg-white px-6 py-10 text-center">
        <Lock className="mx-auto mb-3 h-8 w-8 text-muted" aria-hidden />
        <p className="font-semibold">Not available yet</p>
        <p className="mt-1 text-sm text-muted">{messages[seller.status]}</p>
        <Link to="/seller" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
          Go to dashboard
        </Link>
      </div>
    )
  }

  return <>{children}</>
}