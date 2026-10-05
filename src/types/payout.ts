// GET /api/seller/earnings and /api/admin/payouts

export type PayoutStatus = 'Requested' | 'Paid' | 'Rejected'

export interface PayoutAccount {
  bankName: string
  accountNumber: string
  accountName: string
}

export interface Payout extends PayoutAccount {
  id: string
  amount: number
  status: PayoutStatus
  reference: string | null
  rejectReason: string | null
  requestedAt: string
  processedAt: string | null
}

export interface Earning {
  orderId: string
  sellerOrderId: string
  orderNumber: string
  sales: number
  commissionRate: number
  commission: number
  netAmount: number
  earnedAt: string
  availableAt: string
  // Past the hold, so it counts towards what can be withdrawn.
  isAvailable: boolean
}

export interface Earnings {
  // Ready to withdraw (past the hold, minus paid and requested payouts).
  available: number
  // Delivered less than holdDays ago.
  onHold: number
  // Requested, waiting for Prodify to pay.
  inProgress: number
  paidOut: number
  totalEarned: number
  commissionRate: number
  holdDays: number
  minimumPayout: number
  account: PayoutAccount | null
  hasOpenRequest: boolean
  recentEarnings: Earning[]
  payouts: Payout[]
}

export interface AdminPayout extends Payout {
  sellerId: string
  sellerName: string
  sellerEmail: string
}

export interface AdminPayoutQuery {
  status?: PayoutStatus
  search?: string
  pageNumber?: number
  pageSize?: number
}

export interface PlatformSettings {
  // Percent, e.g. 10 = 10%.
  commissionRate: number
}
