import { Link, useParams, useSearchParams } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { useCategories, useProducts } from '../hooks/useCatalog'
import { ProductGrid } from '../components/ProductGrid'
import { Pagination } from '../components/Pagination'
import { PriceFilter } from '../components/PriceFilter'
import { ErrorAlert } from '../../../components/ui/Alert'
import { getErrorMessage } from '../../../services/api/apiError'
import { formatNaira } from '../../../lib/format'
import type { ProductSort } from '../../../types/catalog'

const PAGE_SIZE = 20

const sortOptions: { value: ProductSort; label: string }[] = [
  { value: 'newest', label: 'Newest arrivals' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A to Z' },
]

function numberParam(value: string | null): number | undefined {
  if (value === null || value === '') return undefined
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

// Used for both /search?q=... and /category/:categoryId.
// All filters live in the URL, so results can be shared, bookmarked and survive a refresh.
export function ProductListPage() {
  const { categoryId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get('q')?.trim() || undefined
  const sortParam = searchParams.get('sort') as ProductSort | null
  const sort = sortOptions.some((o) => o.value === sortParam) ? sortParam! : 'newest'
  const minPrice = numberParam(searchParams.get('minPrice'))
  const maxPrice = numberParam(searchParams.get('maxPrice'))
  const page = Math.max(1, Math.floor(numberParam(searchParams.get('page')) ?? 1))

  const { data: categories } = useCategories()
  const category = categories?.find((c) => c.id === categoryId)
  const subCategories = categories?.filter((c) => c.parentCategoryId === categoryId) ?? []

  const { data, isLoading, isFetching, error } = useProducts({
    search,
    categoryId,
    sort,
    minPrice,
    maxPrice,
    pageNumber: page,
    pageSize: PAGE_SIZE,
  })

  // Changing any filter goes back to page 1.
  function updateParams(changes: Record<string, string | number | undefined>, resetPage = true) {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(changes)) {
      if (value === undefined || value === '') next.delete(key)
      else next.set(key, String(value))
    }
    if (resetPage) next.delete('page')
    setSearchParams(next)
  }

  function goToPage(nextPage: number) {
    updateParams({ page: nextPage === 1 ? undefined : nextPage }, false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const hasPriceFilter = minPrice !== undefined || maxPrice !== undefined
  const title = search ? `Results for “${search}”` : (category?.name ?? (categoryId ? 'Category' : 'All products'))

  return (
    <div className="space-y-4">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{search ? 'Search' : title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
        <aside className="space-y-5 rounded-xl border border-border bg-white p-4 lg:self-start">
          <section>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">Categories</h2>
            <ul className="flex flex-wrap gap-2 text-sm lg:block lg:space-y-1">
              {(subCategories.length > 0 ? subCategories : (categories ?? []).filter((c) => !c.parentCategoryId)).map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/category/${c.id}`}
                    className={`block rounded-md px-2 py-1 hover:bg-primary-light hover:text-primary ${
                      c.id === categoryId ? 'bg-primary-light font-semibold text-primary' : ''
                    }`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">Price (₦)</h2>
            <PriceFilter
              minPrice={minPrice}
              maxPrice={maxPrice}
              onApply={(min, max) => updateParams({ minPrice: min, maxPrice: max })}
            />
          </section>
        </aside>

        <section className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold">{title}</h1>
              {data && (
                <p className="text-sm text-muted">
                  {data.totalCount} {data.totalCount === 1 ? 'product' : 'products'} found
                </p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted">Sort by</span>
              <select
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value === 'newest' ? undefined : e.target.value })}
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

          {hasPriceFilter && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-primary-light px-3 py-1 text-primary">
                {minPrice !== undefined ? formatNaira(minPrice) : 'Any'} – {maxPrice !== undefined ? formatNaira(maxPrice) : 'Any'}
              </span>
              <button onClick={() => updateParams({ minPrice: undefined, maxPrice: undefined })} className="font-semibold text-primary hover:underline">
                Clear price
              </button>
            </div>
          )}

          {error ? (
            <ErrorAlert>{getErrorMessage(error, 'Could not load products.')}</ErrorAlert>
          ) : (
            <div className={isFetching && !isLoading ? 'opacity-60 transition-opacity' : ''}>
              <ProductGrid
                products={data?.items}
                isLoading={isLoading}
                empty={
                  <div className="rounded-xl border border-border bg-white px-6 py-14 text-center">
                    <SearchX className="mx-auto mb-3 h-10 w-10 text-muted" aria-hidden />
                    <p className="font-semibold">No products match your search</p>
                    <p className="mt-1 text-sm text-muted">Try different words or remove some filters.</p>
                    {(hasPriceFilter || search) && (
                      <Link to={categoryId ? `/category/${categoryId}` : '/search'} className="mt-4 inline-block font-semibold text-primary hover:underline">
                        Clear all filters
                      </Link>
                    )}
                  </div>
                }
              />
            </div>
          )}

          {data && <Pagination page={data.pageNumber} totalPages={data.totalPages} onChange={goToPage} />}
        </section>
      </div>
    </div>
  )
}