const naira = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
})

const dateTime = new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeStyle: 'short' })

// 189000 -> "₦189,000"
export function formatNaira(amount: number): string {
  return naira.format(amount)
}

// Percentage off, or null when there is no real discount. (189000, 215000) -> 12
export function discountPercent(price: number, compareAtPrice: number | null | undefined): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
}

// The API sends UTC times without a "Z" (e.g. "2026-09-25T08:22:48.123").
// Without it the browser would read them as local time, so add it.
export function formatDateTime(value: string): string {
  const hasTimeZone = /[zZ]|[+-]\d{2}:\d{2}$/.test(value)
  return dateTime.format(new Date(hasTimeZone ? value : `${value}Z`))
}