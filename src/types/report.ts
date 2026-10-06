// GET /api/seller/earnings/sales and /api/admin/dashboard/sales

export type SalesRange = 7 | 30 | 90

export interface SalesDay {
  // "2026-10-05", the day in Nigeria.
  date: string
  sales: number
  orders: number
}

export interface SalesChartData {
  days: SalesRange
  totalSales: number
  totalOrders: number
  // Whole shop only: Prodify's commission on orders delivered in the period.
  commissionEarned: number | null
  // One entry per day, oldest first, including days with no sales.
  points: SalesDay[]
}
