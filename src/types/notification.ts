// GET /api/notifications

export interface AppNotification {
  id: string
  // OrderPlaced, PaymentSuccessful, OrderShipped, OrderDelivered, OrderCancelled, NewOrder, AccountUpdate, Payout, ...
  type: string
  title: string
  message: string
  // Website page it opens, e.g. "/orders/123".
  link: string | null
  isRead: boolean
  createdAt: string
}
