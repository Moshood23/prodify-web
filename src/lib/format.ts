const naira = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
})

// 189000 -> "₦189,000"
export function formatNaira(amount: number): string {
  return naira.format(amount)
}

// Percentage off, or null when there is no real discount. (189000, 215000) -> 12
export function discountPercent(price: number, compareAtPrice: number | null | undefined): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
}