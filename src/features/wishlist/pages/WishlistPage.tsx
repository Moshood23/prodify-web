import { Link, useSearchParams } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useWishlist } from '../hooks'
import { ProductGrid } from '../../catalog/components/ProductGrid'
import { Pagination } from '../../catalog/components/Pagination'
import { ErrorAlert } from '../../../components/ui/Alert'
import { getErrorMessage } from '../../../services/api/apiError'

const PAGE_SIZE = 20

export function WishlistPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const { data, isLoading, isFetching, error } = useWishlist(page, PAGE_SIZE)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Saved items</h1>
        {data && data.totalCount > 0 && (
          <p className="text-sm text-muted">
            {data.totalCount} {data.totalCount === 1 ? 'item' : 'items'}
          </p>
        )}
      </div>

      {error ? (
        <ErrorAlert>{getErrorMessage(error, 'Could not load your saved items.')}</ErrorAlert>
      ) : (
        <div className={isFetching && !isLoading ? 'opacity-60 transition-opacity' : ''}>
          <ProductGrid
            products={data?.items}
            isLoading={isLoading}
            skeletonCount={4}
            empty={
              <div className="rounded-xl border border-border bg-white px-6 py-14 text-center">
                <Heart className="mx-auto mb-3 h-10 w-10 text-muted" aria-hidden />
                <p className="font-semibold">{data && data.totalCount > 0 ? 'These items are no longer for sale' : 'No saved items yet'}</p>
                <p className="mt-1 text-sm text-muted">Tap the heart on any product to save it for later.</p>
                <Link to="/" className="mt-4 inline-block font-semibold text-primary hover:underline">
                  Start shopping
                </Link>
              </div>
            }
          />
        </div>
      )}

      {data && <Pagination page={data.pageNumber} totalPages={data.totalPages} onChange={(next) => setSearchParams(next === 1 ? {} : { page: String(next) })} />}
    </div>
  )
}
