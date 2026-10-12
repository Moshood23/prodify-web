import { Link } from 'react-router-dom'
import { ChevronRight, Zap } from 'lucide-react'
import { useDeals } from '../hooks'
import { Countdown } from './Countdown'
import { DealCard } from './DealCard'

const SHOWN = 5

// The home page's flash sales row. Hidden when nothing is on sale.
export function FlashSaleStrip() {
  const { data } = useDeals()
  const live = data?.live ?? []
  if (live.length === 0) return null

  const endingSoonest = live.reduce((a, b) => (a.endsAt < b.endsAt ? a : b))

  return (
    <section className="overflow-hidden rounded-xl border border-accent bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-accent px-4 py-2.5 text-ink">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Zap className="h-5 w-5 fill-current" aria-hidden /> Flash sales
        </h2>
        <Countdown endsAt={endingSoonest.endsAt} label="Next one ends in" className="text-sm" />
        <Link to="/deals" className="flex items-center text-sm font-semibold hover:underline">
          See all <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 p-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
        {live.slice(0, SHOWN).map((deal) => (
          <DealCard key={deal.flashSaleId} deal={deal} />
        ))}
      </div>
    </section>
  )
}
