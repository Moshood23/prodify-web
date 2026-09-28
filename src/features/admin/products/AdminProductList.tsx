import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Package } from 'lucide-react'
import { useAdminProducts, useSetProductActive } from '../hooks'
import { FilterChips } from '../components/FilterChips'
import { SearchBox } from '../components/SearchBox'
import { ProductStatusBadge } from '../../seller-portal/products/components/ProductStatusBadge'
import { ProductImage } from '../../catalog/components/ProductImage'
import { Pagination } from '../../catalog/components/Pagination'
import { ErrorAlert } from '../../../components/ui/Alert'
import { useToastStore } from '../../../store/toastStore'
import { formatNaira } from '../../../lib/format'
import { getErrorMessage } from '../../../services/api/apiError'
import type { ManagedProductFilter, ManagedProductSummary } from '../../../types/sellerProduct'

const filters: { value?: ManagedProductFilter; label: string }[] = [
  { label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Hidden' },
]

function VisibilityButton({ product }: { product: ManagedProductSummary }) {
  const setActive = useSetProductActive()
  const showToast = useToastStore((s) => s.show)

  return (
    <button
      onClick={() =>
        setActive.mutate(
          { id: product.id, isActive: !product.isActive },
          {
            onSuccess: () => showToast({ kind: 'success', message: product.isActive ? `"${product.name}" hidden from the shop` : `"${product.name}" is back in the shop` }),
            onError: (e) => showToast({ kind: 'error', message: getErrorMessage(e) }),
          },
        )
      }
      disabled={setActive.isPending}
      className={`text-sm font-semibold hover:underline disabled:opacity-50 ${product.isActive ? 'text-danger' : 'text-primary'}`}
    >
      {product.isActive ? 'Hide' : 'Show'}
    </button>
  )
}

// All products (or one seller's) with a Hide/Show switch, for moderation.
export function AdminProductList({ sellerId }: { sellerId?: string }) {
  const [filter, setFilter] = useState<ManagedProductFilter>()
  const [search, setSearch] = useState<string>()
  const [page, setPage] = useState(1)
  const { data, isLoading, isFetching, error } = useAdminProducts({ sellerId, filter, search, pageNumber: page, pageSize: 20 })

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterChips
          label="Product filter"
          options={filters}
          value={filter}
          onChange={(value) => {
            setFilter(value)
            setPage(1)
          }}
        />
        <SearchBox
          label="Search products"
          placeholder="Product name or SKU"
          onSearch={(value) => {
            setSearch(value)
            setPage(1)
          }}
        />
      </div>

      {error && <ErrorAlert>{getErrorMessage(error, 'Could not load products.')}</ErrorAlert>}

      <section className={`overflow-hidden rounded-xl border border-border bg-white ${isFetching && !isLoading ? 'opacity-60' : ''}`}>
        {isLoading ? (
          <div className="h-40 animate-pulse" aria-busy="true" aria-label="Loading products" />
        ) : !data || data.items.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Package className="mx-auto mb-3 h-10 w-10 text-muted" aria-hidden />
            <p className="text-sm text-muted">No products found.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {data.items.map((product) => (
              <li key={product.id} className="flex items-center gap-3 px-4 py-3">
                <ProductImage src={product.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-md" />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    <span className="line-clamp-1">{product.name}</span> <ProductStatusBadge status={product.status} />
                  </p>
                  <p className="truncate text-sm text-muted">
                    {!sellerId && (
                      <>
                        <Link to={`/admin/sellers/${product.sellerId}`} className="hover:text-primary">
                          {product.sellerName}
                        </Link>
                        {' · '}
                      </>
                    )}
                    {product.categoryName} · {product.price === null ? 'no price' : formatNaira(product.price)} · {product.availableStock} in stock
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {(product.status === 'Live' || product.status === 'OutOfStock') && (
                    <Link to={`/products/${product.id}`} target="_blank" aria-label={`View ${product.name} in the shop`} className="text-muted hover:text-primary">
                      <ExternalLink className="h-4 w-4" aria-hidden />
                    </Link>
                  )}
                  <VisibilityButton product={product} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {data && <Pagination page={data.pageNumber} totalPages={data.totalPages} onChange={setPage} />}
    </div>
  )
}