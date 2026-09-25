import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ClipboardList, Package, Wallet } from 'lucide-react'
import { useAdminSeller, useChangeSellerStatus } from '../hooks'
import { StatCard } from '../components/StatCard'
import { SellerStatusBadge } from '../../seller-portal/components/SellerStatusBadge'
import { Button } from '../../../components/ui/Button'
import { TextArea } from '../../../components/ui/TextArea'
import { ErrorAlert } from '../../../components/ui/Alert'
import { formatDateTime, formatNaira } from '../../../lib/format'
import { getErrorMessage, getErrorStatus } from '../../../services/api/apiError'
import type { SellerAction } from '../api/adminApi'
import type { SellerDetails } from '../../../types/admin'

// Reject and suspend need a reason, which the seller will see.
function ReasonForm({ action, onSubmit, onCancel, isPending }: {
  action: 'reject' | 'suspend'
  onSubmit: (reason: string) => void
  onCancel: () => void
  isPending: boolean
}) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (reason.trim().length < 5) {
      setError('Explain the reason in a few words. The seller will see it.')
      return
    }
    onSubmit(reason.trim())
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3 rounded-lg border border-border bg-surface p-4">
      <TextArea
        label={action === 'reject' ? 'Why is this application rejected?' : 'Why is this store suspended?'}
        hint="The seller will see this message."
        maxLength={500}
        rows={3}
        value={reason}
        error={error ?? undefined}
        onChange={(e) => setReason(e.target.value)}
        autoFocus
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="danger" isLoading={isPending}>
          {action === 'reject' ? 'Reject application' : 'Suspend store'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function Actions({ details }: { details: SellerDetails }) {
  const { profile } = details
  const change = useChangeSellerStatus(profile.id)
  const [askingReason, setAskingReason] = useState<'reject' | 'suspend' | null>(null)

  function run(action: SellerAction, reason?: string) {
    change.mutate({ action, reason }, { onSuccess: () => setAskingReason(null) })
  }

  return (
    <section className="space-y-3 rounded-xl border border-border bg-white p-5">
      <h2 className="font-bold">Actions</h2>
      {change.error && <ErrorAlert>{getErrorMessage(change.error, 'Could not update this seller.')}</ErrorAlert>}

      {askingReason ? (
        <ReasonForm action={askingReason} isPending={change.isPending} onSubmit={(reason) => run(askingReason, reason)} onCancel={() => setAskingReason(null)} />
      ) : (
        <div className="flex flex-wrap gap-2">
          {profile.status === 'PendingVerification' && (
            <>
              <Button isLoading={change.isPending} onClick={() => run('approve')}>
                Approve seller
              </Button>
              <Button variant="outline" onClick={() => setAskingReason('reject')}>
                Reject…
              </Button>
            </>
          )}
          {profile.status === 'Approved' && (
            <Button variant="danger" onClick={() => setAskingReason('suspend')}>
              Suspend store…
            </Button>
          )}
          {profile.status === 'Suspended' && (
            <Button isLoading={change.isPending} onClick={() => run('reinstate')}>
              Reinstate store
            </Button>
          )}
          {profile.status === 'Rejected' && <p className="text-sm text-muted">Waiting for the seller to update their details and apply again.</p>}
        </div>
      )}
    </section>
  )
}

export function AdminSellerDetailsPage() {
  const { sellerId } = useParams()
  const { data, isLoading, error } = useAdminSeller(sellerId)

  if (isLoading) return <div className="h-48 animate-pulse rounded-xl bg-white" aria-busy="true" aria-label="Loading seller" />

  if (error || !data) {
    return getErrorStatus(error) === 404 ? (
      <div className="rounded-xl border border-border bg-white px-6 py-12 text-center">
        <p className="font-semibold">Seller not found</p>
        <Link to="/admin/sellers" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
          Back to sellers
        </Link>
      </div>
    ) : (
      <ErrorAlert>{getErrorMessage(error, 'Could not load this seller.')}</ErrorAlert>
    )
  }

  const { profile } = data
  const address = profile.pickupAddress

  return (
    <div className="max-w-5xl space-y-5">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link to="/admin/sellers" className="hover:text-primary">
          Sellers
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{profile.businessName}</span>
      </nav>

      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{profile.businessName}</h1>
        <SellerStatusBadge status={profile.status} />
      </header>

      {profile.statusReason && (
        <p className="rounded-xl border border-border bg-white px-4 py-3 text-sm">
          <span className="font-semibold">{profile.status === 'Suspended' ? 'Suspension reason' : 'Rejection reason'}:</span> {profile.statusReason}
          {profile.statusChangedAt && <span className="text-muted"> ({formatDateTime(profile.statusChangedAt)})</span>}
        </p>
      )}

      <Actions details={data} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Products" value={data.productCount} icon={Package} hint={`${data.activeProductCount} active`} />
        <StatCard label="Orders" value={data.orderCount} icon={ClipboardList} hint="Not counting cancelled" />
        <StatCard label="Sales" value={formatNaira(data.totalSales)} icon={Wallet} hint="Value of those orders" />
      </div>

      <section className="rounded-xl border border-border bg-white p-5">
        <h2 className="mb-3 font-bold">Application details</h2>
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="font-medium">{profile.email}</dd>
          </div>
          <div>
            <dt className="text-muted">Phone</dt>
            <dd className="font-medium">{profile.phoneNumber ?? '—'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted">Pickup address</dt>
            <dd className="font-medium">
              {address
                ? `${address.addressLine1}${address.addressLine2 ? `, ${address.addressLine2}` : ''}, ${address.city}, ${address.state}`
                : '—'}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted">What they sell</dt>
            <dd>{profile.description ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted">Applied on</dt>
            <dd>{formatDateTime(profile.createdAt)}</dd>
          </div>
          {profile.statusChangedAt && (
            <div>
              <dt className="text-muted">Last reviewed</dt>
              <dd>{formatDateTime(profile.statusChangedAt)}</dd>
            </div>
          )}
        </dl>
      </section>
    </div>
  )
}