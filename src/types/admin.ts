import type { OrderDetails, OrderStatus, PaymentMethod } from './order'
import type { SellerOrderStatus } from './sellerOrder'
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
  paidSalesLast7Days: number
  sellerOrdersToFulfil: number
  ordersAwaitingPayment: number
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

// GET /api/admin/orders
export type AdminOrderStage = 'awaiting_payment' | 'in_progress' | 'delivered' | 'cancelled'

export interface AdminOrderQuery {
  stage?: AdminOrderStage
  paymentMethod?: PaymentMethod
  search?: string
  customerId?: string
  from?: string
  to?: string
  pageNumber?: number
  pageSize?: number
}

export interface AdminOrderSummary {
  id: string
  orderNumber: string
  createdAt: string
  status: OrderStatus
  isPaid: boolean
  paymentMethod: PaymentMethod
  total: number
  itemCount: number
  summary: string
  imageUrl: string | null
  customerId: string
  customerName: string
  customerEmail: string
  sellerCount: number
}

// GET /api/admin/orders/{id}
export interface AdminOrder {
  order: OrderDetails
  customer: { id: string; name: string; email: string; phoneNumber: string | null }
  sellerProgress: {
    sellerOrderId: string
    carrier: string | null
    trackingNumber: string | null
    history: { status: SellerOrderStatus; notes: string | null; occurredAt: string }[]
  }[]
}

// GET /api/admin/customers
export interface CustomerSummary {
  id: string
  name: string
  email: string
  phoneNumber: string | null
  createdAt: string
  orderCount: number
  totalSpent: number
}

export interface CustomerDetails {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string | null
  createdAt: string
  orderCount: number
  cancelledOrderCount: number
  totalSpent: number
  addresses: {
    label: string
    recipientName: string
    addressLine1: string
    city: string
    state: string
    phoneNumber: string
    isDefault: boolean
  }[]
}

// GET /api/categories/manage and /api/brands/manage
export interface ManagedCategory {
  id: string
  name: string
  description: string | null
  parentCategoryId: string | null
  productCount: number
  subCategoryCount: number
}

export interface ManagedBrand {
  id: string
  name: string
  description: string | null
  logoUrl: string | null
  productCount: number
}