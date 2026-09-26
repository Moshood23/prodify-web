import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, Package, Plus, Search } from 'lucide-react'
import { useManagedProducts } from '../hooks'
import { ProductStatusBadge } from '../components/ProductStatusBadge'
import { ProductImage } from '../../../catalog/components/ProductImage'
import { Pagination } from '../../../catalog/components/Pagination'
import { ErrorAlert } from '../../../../components/ui/Alert'
import { formatNaira } from '../../../../lib/format'
import { getErrorMessage } from '../../../../services/api/apiError'
import type { ManagedProductFilter } from '../../../../types/sellerProduct'

const tabs: { filter?: ManagedProductFilter; label: string }[] = [
  { label: 'All' },
  { filter: 'active', label: 'Active' },
  { filter: 'inactive', label: 'Hidden' },
]

const newProductLinkClass =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark'

export function SellerProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filter = (searchParams.get('filter') as ManagedProductFilter | null) ?? undefined
  const search = searchParams.get('q') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const [searchText, setSearchText] = useState(search)

  const { data, isLoading, isFetching, error } = useManagedProducts({ filter, search: search || undefined, pageNumber: page, pageSize: 20 })

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

  const isEmptyStore = data && data.totalCount === 0 && !filter && !search

  return (
    <div className="max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link to="/seller/products/new" className={newProductLinkClass}>
          <Plus className="h-4 w-4" aria-hidden /> Add product
        </Link>
      </div>

      {!isEmptyStore && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Product filter" className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const active = tab.filter === filter
              return (
                <button
                  key={tab.label}
                  onClick={() => update({ filter: tab.filter, page: undefined })}
                  aria-pressed={active}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                    active ? 'border-primary bg-primary text-white' : 'border-border bg-white hover:border-primary'
                  }`}
                >
                  {tab.label}
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
              placeholder="Product name or SKU"
              aria-label="Search products"
              maxLength={64}
              className="w-48 bg-transparent px-2 py-1.5 text-sm outline-none sm:w-56"
            />
          </form>
        </div>
      )}

      {error && <ErrorAlert>{getErrorMessage(error, 'Could not load your products.')}</ErrorAlert>}

      {isEmptyStore ? (
        <div className="rounded-xl border border-border bg-white px-6 py-12 text-center">
          <Package className="mx-auto mb-3 h-10 w-10 text-muted" aria-hidden />
          <p className="font-semibold">You have no products yet</p>
          <p className="mt-1 text-sm text-muted">Add your first product: name, photos, price and stock.</p>
          <Link to="/seller/products/new" className={`${newProductLinkClass} mt-4`}>
            <Plus className="h-4 w-4" aria-hidden /> Add product
          </Link>
        </div>
      ) : (
        <section className={`overflow-hidden rounded-xl border border-border bg-white ${isFetching && !isLoading ? 'opacity-60' : ''}`}>
          {isLoading ? (
            <div className="h-40 animate-pulse" aria-busy="true" aria-label="Loading products" />
          ) : !data || data.items.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted">No products match.</p>
          ) : (
            <ul className="divide-y divide-border">
              {data.items.map((product) => (
                <li key={product.id}>
                  <Link to={`/seller/products/${product.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface">
                    <ProductImage src={product.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-md" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 font-medium">{product.name}</p>
                      <p className="truncate text-sm text-muted">
                        {product.categoryName}
                        {product.brandName ? ` · ${product.brandName}` : ''}
                      </p>
                      <div className="mt-1 sm:hidden">
                        <ProductStatusBadge status={product.status} />
                      </div>
                    </div>
                    <div className="hidden w-28 sm:block">
                      <ProductStatusBadge status={product.status} />
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold">{product.price === null ? '—' : formatNaira(product.price)}</p>
                      <p className={`text-xs ${product.availableStock === 0 ? 'text-danger' : 'text-muted'}`}>
                        {product.availableStock} in stock
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {data && <Pagination page={data.pageNumber} totalPages={data.totalPages} onChange={(next) => update({ page: next === 1 ? undefined : String(next) })} />}
    </div>
  )
}