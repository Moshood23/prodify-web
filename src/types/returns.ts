export type ReturnStatus = 'Requested' | 'Rejected' | 'Escalated' | 'Refunded' | 'Declined'

export type ReturnReason = 'Damaged' | 'WrongItem' | 'NotAsDescribed' | 'NoLongerNeeded' | 'Other'

export interface ReturnItem {
  productVariantId: string
  productName: string
  quantity: number
  unitPrice: number
}

export interface ReturnRequest {
  id: string
  orderId: string
  orderNumber: string
  sellerOrderId: string
  sellerName: string
  customerName: string
  paymentMethod: 'Card' | 'PayOnDelivery'
  reason: ReturnReason
  details: string | null
  status: ReturnStatus
  sellerNote: string | null
  customerNote: string | null
  adminNote: string | null
  // What the customer gets back: the items less their share of any voucher. Delivery is not refunded.
  refundAmount: number
  refundedToCard: number
  refundedAsCredit: number
  createdAt: string
  resolvedAt: string | null
  items: ReturnItem[]
}

export interface NewReturn {
  sellerOrderId: string
  reason: ReturnReason
  details?: string
  items: { productVariantId: string; quantity: number }[]
}
