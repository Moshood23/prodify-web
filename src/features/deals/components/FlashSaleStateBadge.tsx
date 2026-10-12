import { stateStyles } from '../flashSaleLabels'
import type { FlashSaleState } from '../../../types/flashSale'

export function FlashSaleStateBadge({ state }: { state: FlashSaleState }) {
  const style = stateStyles[state]
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${style.className}`}>{style.label}</span>
}
