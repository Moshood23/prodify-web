import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { useDeals } from '../hooks'
import { DealCard } from '../components/DealCard'
import { ErrorAlert } from '../../../components/ui/Alert'
import { getErrorMessage } from '../../../services/api/apiError'

const gridClass = 'grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'

export function DealsPage() {
  const { data, isLoading, error } = useDeals()

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-accent p-6 text-ink sm:p-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <Zap className="h-7 w-7 fill-current" aria-hidden /> Flash sales
        </h1>
        <p className="mt-1 text-sm sm:text-base">
          Big discounts for a short time, on a limited number of units. When they're gone, they're gone.
        </p>
      </section>

      {error && <ErrorAlert>{getErrorMessage(error, 'Could not load the flash sales.')}</ErrorAlert>}

      {isLoading ? (
        <div className={gridClass} aria-busy="true" aria-label="Loading flash sales">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aspect-[3/5] animate-pulse rounded-xl bg-white" />
          ))}
        </div>
      ) : (
        data && (
          <>
            <section>
              <h2 className="mb-3 text-lg font-bold">On now</h2>
              {data.live.length === 0 ? (
                <div className="rounded-xl border border-border bg-white px-6 py-12 text-center">
                  <p className="text-sm text-muted">No flash sales right now. Check back soon.</p>
                  <Link to="/search" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
                    Browse all products
                  </Link>
                </div>
              ) : (
                <div className={gridClass}>
                  {data.live.map((deal) => (
                    <DealCard key={deal.flashSaleId} deal={deal} />
                  ))}
                </div>
              )}
            </section>

            {data.upcoming.length > 0 && (
              <section>
                <h2 className="mb-3 text-lg font-bold">Coming up</h2>
                <div className={gridClass}>
                  {data.upcoming.map((deal) => (
                    <DealCard key={deal.flashSaleId} deal={deal} upcoming />
                  ))}
                </div>
              </section>
            )}
          </>
        )
      )}
    </div>
  )
}
