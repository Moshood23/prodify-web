import type { FlashSaleState } from '../../types/flashSale'

export const stateStyles: Record<FlashSaleState, { label: string; className: string }> = {
  Pending: { label: 'Waiting for approval', className: 'bg-accent-light text-accent-dark' },
  Expired: { label: 'Not reviewed in time', className: 'bg-surface text-muted' },
  Upcoming: { label: 'Approved, starts soon', className: 'bg-primary-light text-primary' },
  Live: { label: 'Live', className: 'bg-primary text-white' },
  SoldOut: { label: 'Sold out', className: 'bg-primary-light text-primary' },
  Ended: { label: 'Ended', className: 'bg-surface text-muted' },
  Rejected: { label: 'Not approved', className: 'bg-red-50 text-danger' },
  Cancelled: { label: 'Cancelled', className: 'bg-surface text-muted' },
  Stopped: { label: 'Stopped by Prodify', className: 'bg-red-50 text-danger' },
}

// 3725000 -> "01:02:05"; a day or more -> "2d 01:02:05".
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const days = Math.floor(total / 86400)
  const pad = (n: number) => String(n).padStart(2, '0')
  const time = `${pad(Math.floor((total % 86400) / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`
  return days > 0 ? `${days}d ${time}` : time
}

// Whole percent off, e.g. (15600, 19500) -> 20.
export function percentOff(salePrice: number, wasPrice: number): number {
  return wasPrice > 0 ? Math.round(((wasPrice - salePrice) / wasPrice) * 100) : 0
}
