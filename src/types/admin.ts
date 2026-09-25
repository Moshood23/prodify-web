import type { OrderStatus, PaymentMethod } from './order'
import type { SellerProfile, SellerStatus } from './seller'

export interface AdminDashboard {
  pendingSellers: number
  approvedSellers: number
  suspendedSellers: number
  rejectedSellers: number
  customers: number
  activeProducts: number
  totalOrders: number
  ordersToday: number
  paidSales: number
  recentOrders: RecentOrder[]
}

export interface RecentOrder {
  id: string
  orderNumber: string
  createdAt: string
  customerName: string
  status: OrderStatus
  isPaid: boolean
  paymentMethod: PaymentMethod
  total: number
}

export interface SellerSummary {
  id: string
  businessName: string
  email: string
  phoneNumber: string | null
  status: SellerStatus
  city: string | null
  state: string | null
  createdAt: string
  statusChangedAt: string | null
  productCount: number
}

export interface SellerDetails {
  profile: SellerProfile
  productCount: number
  activeProductCount: number
  orderCount: number
  totalSales: number
}