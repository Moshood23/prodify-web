import { Zap } from 'lucide-react'
import type { FlashSaleOffer } from '../../../types/flashSale'
import { Countdown } from './Countdown'
import { SoldBar } from './SoldBar'

// On the product page, under the price, while a flash sale runs on the chosen option.
export function FlashSaleBox({ sale }: { sale: FlashSaleOffer }) {
  const soldOut = sale.sold >= sale.quantity

  return (
    <div className="space-y-2 rounded-lg border border-accent bg-accent-light/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 font-bold text-accent-dark">
          <Zap className="h-4 w-4 fill-current" aria-hidden /> Flash sale
        </p>
        <Countdown endsAt={sale.endsAt} className="text-sm text-accent-dark" />
      </div>
      <SoldBar sold={sale.sold} quantity={sale.quantity} />
      <p className="text-sm">
        {soldOut
          ? 'All the units at the flash sale price are gone. You can still buy it at the normal price.'
          : sale.allowance === 0
            ? `You've already bought ${sale.maxPerCustomer} at the flash sale price, the most one customer can. More are at the normal price.`
            : `At most ${sale.maxPerCustomer} per customer at this price.`}
      </p>
    </div>
  )
}
