// GET /api/admin/vouchers

export type VoucherDiscountType = 'Percent' | 'Fixed'

export interface Voucher {
  id: string
  code: string
  description: string
  discountType: VoucherDiscountType
  // Percent: 10 = 10% off. Fixed: naira off.
  value: number
  // Items must add up to at least this (0 = any order).
  minOrderAmount: number
  isActive: boolean
  timesUsed: number
  createdAt: string
}

// POST /api/admin/vouchers (code) and PUT /api/admin/vouchers/{id} (isActive).
export interface VoucherInput {
  code?: string
  description: string
  discountType: VoucherDiscountType
  value: number
  minOrderAmount: number
  isActive?: boolean
}
