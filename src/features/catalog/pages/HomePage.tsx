import { Link } from 'react-router-dom'
import { ChevronRight, ShieldCheck, Truck, Undo2 } from 'lucide-react'
import { useCategories, useProducts } from '../hooks/useCatalog'
import { ProductGrid } from '../components/ProductGrid'
import { CategoryIcon } from '../components/CategoryIcon'
import { ErrorAlert } from '../../../components/ui/Alert'
import { getErrorMessage } from '../../../services/api/apiError'
import type { ReactNode } from 'react'

const BUDGET_PRICE = 20000

function SectionHeader({ title, to }: { title: string; to: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-lg font-bold">{title}</h2>
      <Link to={to} className="flex items-center text-sm font-semibold text-primary hover:underline">
        See all <ChevronRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  )
}

function Perk({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">{icon}</span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted">{text}</p>
      </div>
    </div>
  )
}

export function HomePage() {
  const { data: categories, isLoading: loadingCategories } = useCategories()
  const newArrivals = useProducts({ sort: 'newest', pageSize: 10 })
  const budgetBuys = useProducts({ maxPrice: BUDGET_PRICE, sort: 'price_asc', pageSize: 5 })

  const topCategories = (categories ?? []).filter((c) => !c.parentCategoryId)

  return (
    <div className="space-y-8">
      <section className="flex flex-col items-start justify-between gap-4 rounded-xl bg-gradient-to-r from-primary to-primary-dark p-6 text-white sm:flex-row sm:items-center sm:p-8">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Everything you need, delivered</h1>
          <p className="mt-1 text-sm text-primary-light sm:text-base">Phones, fashion, groceries and more from trusted sellers across Nigeria.</p>
        </div>
        <Link to="/search" className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-ink hover:bg-accent-dark">
          Start shopping
        </Link>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Perk icon={<ShieldCheck className="h-5 w-5" aria-hidden />} title="Verified sellers" text="Every seller is approved by Prodify" />
        <Perk icon={<Truck className="h-5 w-5" aria-hidden />} title="Nationwide delivery" text="Track your order to your door" />
        <Perk icon={<Undo2 className="h-5 w-5" aria-hidden />} title="Easy returns" text="Changed your mind? We've got you" />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Shop by category</h2>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-8">
          {loadingCategories
            ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-white" />)
            : topCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.id}`}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border bg-white p-3 text-center text-xs font-medium hover:border-primary hover:text-primary"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary">
                    <CategoryIcon name={category.name} className="h-5 w-5" />
                  </span>
                  <span className="line-clamp-2">{category.name}</span>
                </Link>
              ))}
        </div>
      </section>

      <section>
        <SectionHeader title="New arrivals" to="/search" />
        {newArrivals.error ? (
          <ErrorAlert>{getErrorMessage(newArrivals.error, 'Could not load products.')}</ErrorAlert>
        ) : (
          <ProductGrid products={newArrivals.data?.items} isLoading={newArrivals.isLoading} />
        )}
      </section>

      {(budgetBuys.isLoading || (budgetBuys.data?.items.length ?? 0) > 0) && (
        <section>
          <SectionHeader title="Budget buys under ₦20,000" to={`/search?maxPrice=${BUDGET_PRICE}&sort=price_asc`} />
          <ProductGrid products={budgetBuys.data?.items} isLoading={budgetBuys.isLoading} skeletonCount={5} />
        </section>
      )}
    </div>
  )
}