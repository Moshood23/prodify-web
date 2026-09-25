import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Ban, CheckCircle2, ClipboardList, Clock, Package, Store, XCircle } from 'lucide-react'
import { useMySeller } from '../hooks'
import { ReapplyForm } from '../components/ReapplyForm'
import { SellerStatusBadge } from '../components/SellerStatusBadge'
import { ErrorAlert } from '../../../components/ui/Alert'
import { formatDateTime } from '../../../lib/format'
import { getErrorMessage } from '../../../services/api/apiError'
import type { SellerProfile } from '../../../types/seller'

function StatusPanel({ tone, icon, title, children }: { tone: 'info' | 'warning' | 'danger'; icon: ReactNode; title: string; children: ReactNode }) {
  const tones = {
    info: 'border-accent bg-accent-light',
    warning: 'border-border bg-white',
    danger: 'border-danger bg-red-50',
  }
  return (
    <section className={`space-y-3 rounded-xl border p-5 ${tones[tone]}`}>
      <h2 className="flex items-center gap-2 text-lg font-bold">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  )
}

function StoreDetails({ seller }: { seller: SellerProfile }) {
  const address = seller.pickupAddress
  return (
    <section className="rounded-xl border border-border bg-white p-5">
      <h2 className="mb-3 flex items-center gap-2 font-bold">
        <Store className="h-4 w-4 text-primary" aria-hidden /> Store details
      </h2>
      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Business name</dt>
          <dd className="font-medium">{seller.businessName}</dd>
        </div>
        <div>
          <dt className="text-muted">Email</dt>
          <dd className="font-medium">{seller.email}</dd>
        </div>
        <div>
          <dt className="text-muted">Phone</dt>
          <dd className="font-medium">{seller.phoneNumber ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-muted">Pickup address</dt>
          <dd className="font-medium">{address ? `${address.addressLine1}, ${address.city}, ${address.state}` : '—'}</dd>
        </div>
        {seller.description && (
          <div className="sm:col-span-2">
            <dt className="text-muted">About</dt>
            <dd>{seller.description}</dd>
          </div>
        )}
        <div>
          <dt className="text-muted">Applied on</dt>
          <dd>{formatDateTime(seller.createdAt)}</dd>
        </div>
      </dl>
    </section>
  )
}

function NextSteps() {
  const steps = [
    { icon: Package, title: 'Add your products', text: 'Photos, options like size or colour, prices and stock.', to: '/seller/products' },
    { icon: ClipboardList, title: 'Fulfil orders', text: 'Confirm, pack and ship orders from your customers.', to: '/seller/orders' },
  ]
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {steps.map(({ icon: Icon, title, text, to }) => (
        <Link key={to} to={to} className="flex gap-3 rounded-xl border border-border bg-white p-4 hover:border-primary">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <span>
            <span className="block font-semibold">{title}</span>
            <span className="text-sm text-muted">{text}</span>
          </span>
        </Link>
      ))}
    </div>
  )
}

export function SellerDashboardPage() {
  const { data: seller, isLoading, error } = useMySeller()

  if (isLoading) return <div className="h-40 animate-pulse rounded-xl bg-white" aria-busy="true" aria-label="Loading" />
  if (error || !seller) return <ErrorAlert>{getErrorMessage(error, 'Could not load your store.')}</ErrorAlert>

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{seller.businessName}</h1>
        <SellerStatusBadge status={seller.status} />
      </div>

      {seller.status === 'PendingVerification' && (
        <StatusPanel tone="info" icon={<Clock className="h-5 w-5 text-accent-dark" aria-hidden />} title="Your application is being reviewed">
          <p className="text-sm">
            Thanks for applying! Our team is checking your details, usually within 1–2 working days. You can add products once your
            store is approved.
          </p>
        </StatusPanel>
      )}

      {seller.status === 'Rejected' && (
        <StatusPanel tone="warning" icon={<XCircle className="h-5 w-5 text-danger" aria-hidden />} title="Your application was not approved">
          {seller.statusReason && (
            <p className="rounded-md bg-surface px-3 py-2 text-sm">
              <span className="font-semibold">Reason:</span> {seller.statusReason}
            </p>
          )}
          <p className="text-sm text-muted">Update your details below and send your application again.</p>
          <ReapplyForm seller={seller} />
        </StatusPanel>
      )}

      {seller.status === 'Suspended' && (
        <StatusPanel tone="danger" icon={<Ban className="h-5 w-5 text-danger" aria-hidden />} title="Your store is suspended">
          <p className="text-sm">Your products are hidden from shoppers until the suspension is lifted.</p>
          {seller.statusReason && (
            <p className="rounded-md bg-white px-3 py-2 text-sm">
              <span className="font-semibold">Reason:</span> {seller.statusReason}
            </p>
          )}
          <p className="text-sm text-muted">Contact Prodify support to resolve this.</p>
        </StatusPanel>
      )}

      {seller.status === 'Approved' && (
        <>
          <StatusPanel tone="warning" icon={<CheckCircle2 className="h-5 w-5 text-primary" aria-hidden />} title="Your store is live">
            <p className="text-sm text-muted">Shoppers can see and buy your products. Here is what to do next:</p>
          </StatusPanel>
          <NextSteps />
        </>
      )}

      <StoreDetails seller={seller} />
    </div>
  )
}