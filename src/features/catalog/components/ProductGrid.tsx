import type { ReactNode } from 'react'
import type { ProductSummary } from '../../../types/catalog'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
  products: ProductSummary[] | undefined
  isLoading: boolean
  skeletonCount?: number
  empty?: ReactNode
}

const gridClass = 'grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'

export function ProductGrid({ products, isLoading, skeletonCount = 10, empty }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className={gridClass} aria-busy="true" aria-label="Loading products">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-border bg-white p-3">
            <div className="mb-3 aspect-square rounded-lg bg-slate-100" />
            <div className="mb-2 h-3 w-3/4 rounded bg-slate-100" />
            <div className="mb-4 h-3 w-1/2 rounded bg-slate-100" />
            <div className="h-9 rounded-lg bg-slate-100" />
          </div>
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return <>{empty ?? <p className="py-10 text-center text-muted">No products found.</p>}</>
  }

  return (
    <div className={gridClass}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}