// Shapes returned by the cart, customer and order endpoints of the API.
import type { SellerOrderStatus } from './sellerOrder'
export interface Cart {
  id: string | null
  total: number
  itemCount: number
  // Something can't be bought right now (removed, sold out, not enough left).
  hasProblems: boolean
  items: CartItem[]
}

export interface CartItem {
  id: string
  productVariantId: string
  productId: string
  productName: string
  variantName: string | null
  imageUrl: string | null
  quantity: number
  unitPrice: number
  subtotal: number
  availableQuantity: number
  isAvailable: boolean
  inStock: boolean
}

export interface CustomerProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string | null
  addresses: CustomerAddress[]
}

export interface CustomerAddress {
  id: string
  label: string
  recipientName: string
  addressLine1: string
  addressLine2: string | null
  city: string
  state: string
  postalCode: string | null
  country: string
  phoneNumber: string
  isDefault: boolean
}

export type PaymentMethod = 'Card' | 'PayOnDelivery'

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'PartiallyShipped'
  | 'Shipped'
  | 'PartiallyDelivered'
  | 'Delivered'
  | 'Cancelled'

export interface OrderSummary {
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
}

export interface OrderDetails {
  id: string
  orderNumber: string
  createdAt: string
  isPaid: boolean
  paymentMethod: PaymentMethod
  status: OrderStatus
  itemsTotal: number
  deliveryFee: number
  voucherCode: string | null
  discount: number
  // Store credit put towards the order, and how much of it went back to the customer's credit.
  creditUsed: number
  creditReturned: number
  total: number
  refundedAmount: number
  canCancel: boolean
  canPay: boolean
  shippingAddress: OrderAddress
  sellerOrders: SellerOrder[]
}

export interface OrderAddress {
  recipientName: string
  addressLine1: string
  addressLine2: string | null
  city: string
  state: string
  postalCode: string | null
  country: string
  phoneNumber: string
}

export interface SellerOrder {
  id: string
  sellerId: string
  sellerName: string
  status: SellerOrderStatus
  total: number
  cancelReason: string | null
  items: OrderItem[]
}

export interface OrderItem {
  productVariantId: string
  productId: string | null
  productName: string
  imageUrl: string | null
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface DeliveryFee {
  state: string
  fee: number
}
// POST /api/checkout/voucher: what a voucher takes off the current cart.
export interface VoucherCheck {
  code: string
  description: string
  discount: number
}

// How card orders are paid: the built-in test card form, or Paystack's own page.
export interface PaymentOptions {
  provider: 'Simulated' | 'Paystack'
  testMode: boolean
}

export interface PaystackStart {
  authorizationUrl: string
  reference: string
}

// Refunded: the money arrived after the order could no longer take it, so it was sent back.
export interface PaystackOutcome {
  status: 'Paid' | 'Pending' | 'Failed' | 'Refunded'
  message: string | null
}
