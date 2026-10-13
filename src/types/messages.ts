// Shapes returned by the conversation endpoints of the API.

export type MessageSender = 'Customer' | 'Seller'

// Who is looking: the customer, the seller, or Prodify's staff (read-only).
export type MessagesViewer = 'customer' | 'seller' | 'admin'

// One conversation in an inbox.
export interface ConversationSummary {
  id: string
  customerId: string
  customerName: string
  sellerId: string
  sellerName: string
  // A product's name, or "Order ORD-...".
  subject: string
  productId: string | null
  orderId: string | null
  imageUrl: string | null
  lastMessageAt: string
  lastMessagePreview: string
  lastSender: MessageSender
  // Messages the viewer hasn't read yet (always 0 for Prodify's staff).
  unread: number
}

export interface Message {
  id: string
  sender: MessageSender
  body: string
  sentAt: string
  // A phone number or email address was hidden.
  hadContactDetails: boolean
}

export interface Conversation extends ConversationSummary {
  messages: Message[]
}

// POST /api/conversations: about a product, or about an order (then also which seller).
export interface NewConversation {
  productId?: string
  orderId?: string
  sellerId?: string
  message: string
}
