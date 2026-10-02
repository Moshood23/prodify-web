const naira = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
})

const dateTime = new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeStyle: 'short' })
const dateOnly = new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' })

// 189000 -> "₦189,000"
export function formatNaira(amount: number): string {
  return naira.format(amount)
}

// Percentage off, or null when there is no real discount. (189000, 215000) -> 12
export function discountPercent(price: number, compareAtPrice: number | null | undefined): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
}

export function formatDateTime(value: string): string {
  return dateTime.format(parseApiDate(value))
}

// "30 Sept 2026"
export function formatDate(value: string): string {
  return dateOnly.format(parseApiDate(value))
}

function parseApiDate(value: string): Date {
  const hasTimeZone = /[zZ]|[+-]\d{2}:\d{2}$/.test(value)
  return new Date(hasTimeZone ? value : `${value}Z`)
}