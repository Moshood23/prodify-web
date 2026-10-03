import { Link, useParams } from 'react-router-dom'
import { CalendarDays, Package, SearchX, Store as StoreIcon } from 'lucide-react'
import { useProducts, useStore } from '../hooks/useCatalog'
import { ProductGrid } from '../components/ProductGrid'
import { Pagination } from '../components/Pagination'
import { RatingBadge } from '../components/RatingBadge'
import { SearchBox } from '../../admin/components/SearchBox'
import { useUrlFilters } from '../../admin/useUrlFilters'
import { ErrorAlert } from '../../../components/ui/Alert'
import { getErrorMessage, getErrorStatus } from '../../../services/api/apiError'
import type { ProductSort } from '../../../types/catalog'

const PAGE_SIZE = 20

const sortOptions: { value: ProductSort; label: string }[] = [
  { value: 'newest', label: 'Newest arrivals' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
]

const joined = new Intl.DateTimeFormat('en-NG', { month: 'long', year: 'numeric' })

export function StorePage() {
  const { sellerId } = useParams()
  const filters = useUrlFilters()
  const search = filters.get('q')
  const sortParam = filters.get('sort') as ProductSort | undefined
  const sort = sortOptions.some((o) => o.value === sortParam) ? sortParam! : 'newest'

  const store = useStore(sellerId)
  const products = useProducts({ sellerId, search, sort, pageNumber: filters.page, pageSize: PAGE_SIZE })

  if (store.isLoading) {
    return <div className="h-40 animate-pulse rounded-xl bg-white" aria-busy="true" aria-label="Loading store" />
  }

  if (store.error || !store.data) {
    if (getErrorStatus(store.error) === 404 || !store.error) {
      return (
        <div className="rounded-xl border border-border bg-white px-6 py-16 text-center">
          <StoreIcon className="mx-auto mb-3 h-10 w-10 text-muted" aria-hidden />
          <h1 className="text-lg font-bold">This store is not open</h1>
          <Link to="/" className="mt-4 inline-block font-semibold text-primary hover:underline">
            Continue shopping
          </Link>
        </div>
      )
    }
    return <ErrorAlert>{getErrorMessage(store.error, 'Could not load this store.')}</ErrorAlert>
  }

  const s = store.data
  const data = products.data

  return (
    <div className="space-y-4">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{s.businessName}</span>
      </nav>

      <header className="flex flex-wrap items-start gap-4 rounded-xl border border-border bg-white p-4 sm:p-6">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-light text-2xl font-bold text-primary">
          {s.businessName.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <h1 className="text-2xl font-bold">{s.businessName}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            {s.reviewCount > 0 && <RatingBadge rating={s.rating} count={s.reviewCount} />}
            <span className="flex items-center gap-1">
              <Package className="h-4 w-4" aria-hidden /> {s.productCount} {s.productCount === 1 ? 'product' : 'products'}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" aria-hidden /> Selling on Prodify since {joined.format(new Date(s.joinedAt))}
            </span>
          </div>
          {s.description && <p className="whitespace-pre-line text-sm leading-relaxed">{s.description}</p>}
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchBox key={sellerId} initialValue={search} label="Search this store" placeholder="Search this store" onSearch={(q) => filters.update({ q })} />
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">Sort by</span>
          <select
            value={sort}
            onChange={(e) => filters.update({ sort: e.target.value === 'newest' ? undefined : e.target.value })}
            className="rounded-lg border border-border bg-white px-2 py-1.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {products.error ? (
        <ErrorAlert>{getErrorMessage(products.error, 'Could not load products.')}</ErrorAlert>
      ) : (
        <div className={products.isFetching && !products.isLoading ? 'opacity-60 transition-opacity' : ''}>
          <ProductGrid
            products={data?.items}
            isLoading={products.isLoading}
            empty={
              <div className="rounded-xl border border-border bg-white px-6 py-14 text-center">
                <SearchX className="mx-auto mb-3 h-10 w-10 text-muted" aria-hidden />
                <p className="font-semibold">{search ? 'No products match your search' : 'This store has no products yet'}</p>
                {search && (
                  <button onClick={() => filters.update({ q: undefined })} className="mt-4 font-semibold text-primary hover:underline">
                    Show all products
                  </button>
                )}
              </div>
            }
          />
        </div>
      )}

      {data && (
        <Pagination
          page={data.pageNumber}
          totalPages={data.totalPages}
          onChange={(next) => {
            filters.update({ page: next === 1 ? undefined : String(next) })
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        />
      )}
    </div>
  )
}