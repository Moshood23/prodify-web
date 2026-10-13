import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MessageSquare, Search, ShieldCheck } from 'lucide-react'
import { useConversation, useConversations, useMarkRead } from '../hooks'
import { ConversationList } from '../components/ConversationList'
import { MessageThread } from '../components/MessageThread'
import { ReplyBox } from '../components/ReplyBox'
import { ErrorAlert } from '../../../components/ui/Alert'
import { getErrorMessage, getErrorStatus } from '../../../services/api/apiError'
import type { Conversation, MessagesViewer } from '../../../types/messages'

const basePaths: Record<MessagesViewer, string> = {
  customer: '/account/messages',
  seller: '/seller/messages',
  admin: '/admin/messages',
}

const intro: Record<MessagesViewer, string> = {
  customer: 'Questions you asked sellers about products and orders. Use "Ask the seller" on a product page to start one.',
  seller: 'Questions from customers about your products and orders. Quick answers help you sell.',
  admin: 'Every conversation between customers and sellers, for checking disputes. You can read them but not reply.',
}

function Inbox({ viewer }: { viewer: MessagesViewer }) {
  const [search, setSearch] = useState('')
  const [applied, setApplied] = useState('')
  const { data, isLoading, isFetching, error } = useConversations(viewer, viewer === 'admin' ? applied : undefined)

  return (
    <div className="max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-sm text-muted">{intro[viewer]}</p>
      </div>

      {viewer === 'admin' && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setApplied(search.trim())
          }}
          className="flex max-w-md gap-2"
        >
          <label htmlFor="message-search" className="sr-only">
            Search messages
          </label>
          <input
            id="message-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Order number, customer or store"
            className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
          />
          <button type="submit" className="rounded-lg bg-primary px-3 text-white hover:bg-primary-dark" aria-label="Search">
            <Search className="h-4 w-4" aria-hidden />
          </button>
        </form>
      )}

      {error && <ErrorAlert>{getErrorMessage(error, 'Could not load your messages.')}</ErrorAlert>}

      <section className={`overflow-hidden rounded-xl border border-border bg-white ${isFetching && !isLoading ? 'opacity-80' : ''}`}>
        {isLoading ? (
          <div className="h-40 animate-pulse" aria-busy="true" aria-label="Loading messages" />
        ) : !data || data.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted" aria-hidden />
            <p className="text-sm text-muted">{applied ? 'No conversations match.' : 'No messages yet.'}</p>
          </div>
        ) : (
          <ConversationList viewer={viewer} conversations={data} basePath={basePaths[viewer]} />
        )}
      </section>
    </div>
  )
}

// Where the conversation's product or order can be looked at.
function topicLink(viewer: MessagesViewer, c: Conversation) {
  if (c.productId) return `/products/${c.productId}`
  if (c.orderId && viewer === 'customer') return `/orders/${c.orderId}`
  if (c.orderId && viewer === 'admin') return `/admin/orders/${c.orderId}`
  return null
}

function Thread({ viewer }: { viewer: MessagesViewer }) {
  const { conversationId } = useParams()
  const { data, isLoading, error } = useConversation(viewer, conversationId)
  const markRead = useMarkRead(viewer === 'admin' ? 'customer' : viewer)
  const { mutate: markAsRead } = markRead

  // Opening the conversation (or a new message arriving while it's open) marks it as read.
  const unread = data?.unread ?? 0
  useEffect(() => {
    if (viewer !== 'admin' && conversationId && unread > 0) markAsRead(conversationId)
  }, [viewer, conversationId, unread, markAsRead])

  const back = (
    <Link to={basePaths[viewer]} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
      <ArrowLeft className="h-4 w-4" aria-hidden /> All messages
    </Link>
  )

  if (isLoading)
    return <div className="h-64 max-w-4xl animate-pulse rounded-xl bg-white" aria-busy="true" aria-label="Loading conversation" />

  if (error || !data)
    return (
      <div className="max-w-4xl space-y-4">
        {back}
        <ErrorAlert>
          {getErrorStatus(error) === 404 ? 'This conversation was not found.' : getErrorMessage(error, 'Could not load this conversation.')}
        </ErrorAlert>
      </div>
    )

  const other =
    viewer === 'customer' ? data.sellerName : viewer === 'seller' ? data.customerName : `${data.customerName} and ${data.sellerName}`
  const link = topicLink(viewer, data)

  return (
    <div className="max-w-4xl space-y-4">
      {back}
      <section className="overflow-hidden rounded-xl border border-border bg-white">
        <header className="border-b border-border p-4">
          <h1 className="text-lg font-bold">{other}</h1>
          <p className="text-sm text-muted">
            About{' '}
            {link ? (
              <Link to={link} className="font-semibold text-primary hover:underline">
                {data.subject}
              </Link>
            ) : (
              <span className="font-semibold">{data.subject}</span>
            )}
          </p>
        </header>

        <MessageThread viewer={viewer} conversation={data} />

        {viewer === 'admin' ? (
          <p className="flex items-center gap-2 border-t border-border bg-surface p-4 text-sm text-muted">
            <ShieldCheck className="h-4 w-4" aria-hidden /> You're reading this as Prodify staff. Only the customer and the seller can
            reply.
          </p>
        ) : (
          <ReplyBox viewer={viewer} conversationId={data.id} />
        )}
      </section>
      <p className="text-xs text-muted">Prodify may read conversations to help settle a problem with an order.</p>
    </div>
  )
}

export function CustomerMessagesPage() {
  return <Inbox viewer="customer" />
}

export function CustomerConversationPage() {
  return <Thread viewer="customer" />
}

export function SellerMessagesPage() {
  return <Inbox viewer="seller" />
}

export function SellerConversationPage() {
  return <Thread viewer="seller" />
}

export function AdminMessagesPage() {
  return <Inbox viewer="admin" />
}

export function AdminConversationPage() {
  return <Thread viewer="admin" />
}
