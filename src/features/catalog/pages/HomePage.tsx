import { Button } from '../../../components/ui/Button'

// Temporary home page; the product grid comes in the catalog batch.
export function HomePage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col items-start justify-between gap-4 rounded-xl bg-gradient-to-r from-primary to-primary-dark p-6 text-white sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Mega Deals Week</h1>
          <p className="text-sm text-primary-light">Up to 40% off phones · Pay on delivery available</p>
        </div>
        <Button variant="accent">Shop now</Button>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Top picks for you</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-white p-3">
              <div className="mb-3 aspect-square rounded-lg bg-slate-100" />
              <div className="mb-2 h-3 w-3/4 rounded bg-slate-100" />
              <div className="h-3 w-1/2 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}