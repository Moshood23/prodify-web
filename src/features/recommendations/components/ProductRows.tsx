import { ProductCard } from '../../catalog/components/ProductCard'
import { useRecentlyViewed, useSimilarProducts } from '../hooks'
import type { ProductSummary } from '../../../types/catalog'

// A row of product cards that scrolls sideways on small screens.
function ProductRow({ title, products, isLoading }: { title: string; products: ProductSummary[] | undefined; isLoading: boolean }) {
  const cardClass = 'w-44 shrink-0 snap-start sm:w-48 lg:w-52'

  return (
    <section aria-label={title}>
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:gap-4">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`${cardClass} animate-pulse rounded-xl border border-border bg-white p-3`} aria-hidden>
                <div className="mb-3 aspect-square rounded-lg bg-slate-100" />
                <div className="mb-2 h-3 w-3/4 rounded bg-slate-100" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
              </div>
            ))
          : products?.map((product) => (
              <div key={product.id} className={cardClass}>
                <ProductCard product={product} />
              </div>
            ))}
      </div>
    </section>
  )
}

export function SimilarProductsRow({ productId }: { productId: string }) {
  const { data, isLoading } = useSimilarProducts(productId)

  if (!isLoading && (!data || data.length === 0)) return null
  return <ProductRow title="You may also like" products={data} isLoading={isLoading} />
}

// Hidden until there is something to show, so first-time visitors don't see an empty row.
export function RecentlyViewedRow({ exclude }: { exclude?: string }) {
  const { data } = useRecentlyViewed(exclude)

  if (!data || data.length === 0) return null
  return <ProductRow title="Recently viewed" products={data} isLoading={false} />
}
