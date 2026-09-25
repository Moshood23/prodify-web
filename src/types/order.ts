// Shapes returned by the cart, customer and order endpoints of the API.

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
  total: number
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
  status: string
  total: number
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