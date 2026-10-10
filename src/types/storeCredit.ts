export interface StoreCreditEntry {
  id: string
  // Positive when credit is added, negative when it is spent.
  amount: number
  kind: 'Refund' | 'Spent'
  description: string
  orderId: string | null
  createdAt: string
}

export interface StoreCredit {
  balance: number
  entries: StoreCreditEntry[]
}
