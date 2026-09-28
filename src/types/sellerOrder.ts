// Seller Centre orders (GET /api/seller-orders...): a seller's part of a customer order.
import type { PaymentMethod } from './order'

export type SellerOrderStatus = 'Pending' | 'Confirmed' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled'

export interface SellerOrderSummary {
  id: string
  orderId: string
  orderNumber: string
  createdAt: string
  status: SellerOrderStatus
  paymentMethod: PaymentMethod
  isPaid: boolean
  customerName: string
  city: string
  state: string
  itemCount: number
  summary: string
  imageUrl: string | null
  total: number
}

export interface SellerOrderCounts {
  toConfirm: number
  toPack: number
  toShip: number
  shipped: number
  delivered: number
  cancelled: number
}

export interface SellerOrderDetails {
  id: string
  orderId: string
  orderNumber: string
  createdAt: string
  status: SellerOrderStatus
  paymentMethod: PaymentMethod
  isPaid: boolean
  total: number
  shippingAddress: {
    recipientName: string
    phoneNumber: string
    addressLine1: string
    addressLine2: string | null
    city: string
    state: string
  }
  items: {
    productVariantId: string
    productId: string | null
    productName: string
    sku: string | null
    imageUrl: string | null
    quantity: number
    unitPrice: number
    subtotal: number
  }[]
  shipment: {
    carrier: string | null
    trackingNumber: string | null
    shippedAt: string | null
    deliveredAt: string | null
  } | null
  history: { status: SellerOrderStatus; notes: string | null; occurredAt: string }[]
  canConfirm: boolean
  canPack: boolean
  canShip: boolean
  canDeliver: boolean
  canCancel: boolean
}

export interface SellerOrderQuery {
    // Admins only: whose orders.
  sellerId?: string
  status?: SellerOrderStatus
  search?: string
  pageNumber?: number
  pageSize?: number
}

export type SellerOrderStatusChange =
  | { status: 'Confirmed' | 'Packed' | 'Delivered' }
  | { status: 'Shipped'; carrier: string; trackingNumber?: string }
  | { status: 'Cancelled'; reason: string }