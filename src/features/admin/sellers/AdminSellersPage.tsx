import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, Search } from 'lucide-react'
import { useAdminDashboard, useAdminSellers } from '../hooks'
import { SellerStatusBadge } from '../../seller-portal/components/SellerStatusBadge'
import { Pagination } from '../../catalog/components/Pagination'
import { ErrorAlert } from '../../../components/ui/Alert'
import { formatDateTime } from '../../../lib/format'
import { getErrorMessage } from '../../../services/api/apiError'
import type { AdminDashboard } from '../../../types/admin'
import type { SellerStatus } from '../../../types/seller'

const tabs: { status?: SellerStatus; label: string; count?: (d: AdminDashboard) => number }[] = [
  { status: 'PendingVerification', label: 'Pending', count: (d) => d.pendingSellers },
  { status: 'Approved', label: 'Approved', count: (d) => d.approvedSellers },
  { status: 'Suspended', label: 'Suspended', count: (d) => d.suspendedSellers },
  { status: 'Rejected', label: 'Rejected', count: (d) => d.rejectedSellers },
  { label: 'All' },
]

export function AdminSellersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = (searchParams.get('status') as SellerStatus | null) ?? undefined
  const search = searchParams.get('q') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const [searchText, setSearchText] = useState(search)

  const { data: counts } = useAdminDashboard()
  const { data, isLoading, isFetching, error } = useAdminSellers({ status, search: search || undefined, pageNumber: page, pageSize: 20 })

  function update(changes: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    setSearchParams(next)
  }

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    update({ q: searchText.trim() || undefined, page: undefined })
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Sellers</h1>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Seller status" className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const active = tab.status === status
            const count = counts && tab.count ? tab.count(counts) : undefined
            return (
              <button
                key={tab.label}
                onClick={() => update({ status: tab.status, page: undefined })}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                  active ? 'border-primary bg-primary text-white' : 'border-border bg-white hover:border-primary'
                }`}
              >
                {tab.label}
                {count !== undefined && <span className={`ml-1.5 ${active ? 'text-primary-light' : 'text-muted'}`}>{count}</span>}
              </button>
            )
          })}
        </nav>

        <form onSubmit={handleSearch} role="search" className="flex items-center rounded-lg border border-border bg-white px-2">
          <Search className="h-4 w-4 text-muted" aria-hidden />
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Business name or email"
            aria-label="Search sellers"
            className="w-56 bg-transparent px-2 py-1.5 text-sm outline-none"
          />
        </form>
      </div>

      {error && <ErrorAlert>{getErrorMessage(error, 'Could not load sellers.')}</ErrorAlert>}

      <section className={`overflow-hidden rounded-xl border border-border bg-white ${isFetching && !isLoading ? 'opacity-60' : ''}`}>
        {isLoading ? (
          <div className="h-40 animate-pulse" aria-busy="true" aria-label="Loading sellers" />
        ) : !data || data.items.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted">
            {status === 'PendingVerification' ? 'No applications waiting for review.' : 'No sellers found.'}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {data.items.map((seller) => (
              <li key={seller.id}>
                <Link to={`/admin/sellers/${seller.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-surface">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-medium">
                      {seller.businessName} <SellerStatusBadge status={seller.status} />
                    </p>
                    <p className="truncate text-sm text-muted">
                      {seller.email}
                      {seller.phoneNumber ? ` · ${seller.phoneNumber}` : ''}
                      {seller.city ? ` · ${seller.city}, ${seller.state}` : ''}
                    </p>
                  </div>
                  <div className="hidden text-right text-sm sm:block">
                    <p>
                      {seller.productCount} {seller.productCount === 1 ? 'product' : 'products'}
                    </p>
                    <p className="text-xs text-muted">Applied {formatDateTime(seller.createdAt)}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {data && <Pagination page={data.pageNumber} totalPages={data.totalPages} onChange={(next) => update({ page: next === 1 ? undefined : String(next) })} />}
    </div>
  )
}