import { Link } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { ProductImage } from '../../catalog/components/ProductImage'
import { formatDateTime } from '../../../lib/format'
import type { ConversationSummary, MessagesViewer } from '../../../types/messages'

interface ConversationListProps {
  viewer: MessagesViewer
  conversations: ConversationSummary[]
  // Where a conversation opens, e.g. /account/messages.
  basePath: string
}

// Who the conversation is with, from the viewer's side.
function withWhom(viewer: MessagesViewer, c: ConversationSummary) {
  if (viewer === 'customer') return c.sellerName
  if (viewer === 'seller') return c.customerName
  return `${c.customerName} and ${c.sellerName}`
}

function fromViewer(viewer: MessagesViewer, c: ConversationSummary) {
  return (viewer === 'customer' && c.lastSender === 'Customer') || (viewer === 'seller' && c.lastSender === 'Seller')
}

export function ConversationList({ viewer, conversations, basePath }: ConversationListProps) {
  return (
    <ul className="divide-y divide-border">
      {conversations.map((c) => (
        <li key={c.id}>
          <Link to={`${basePath}/${c.id}`} className="flex gap-3 p-4 hover:bg-surface">
            {c.imageUrl || c.productId ? (
              <ProductImage src={c.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg" />
            ) : (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                <MessageSquare className="h-5 w-5" aria-hidden />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className={`truncate text-sm ${c.unread > 0 ? 'font-bold' : 'font-semibold'}`}>{withWhom(viewer, c)}</p>
                <p className="shrink-0 text-xs text-muted">{formatDateTime(c.lastMessageAt)}</p>
              </div>
              <p className="truncate text-xs text-muted">{c.subject}</p>
              <div className="flex items-center justify-between gap-2">
                <p className={`truncate text-sm ${c.unread > 0 ? 'font-semibold text-ink' : 'text-muted'}`}>
                  {fromViewer(viewer, c) && 'You: '}
                  {c.lastMessagePreview}
                </p>
                {c.unread > 0 && (
                  <span
                    className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-ink"
                    aria-label={`${c.unread} unread`}
                  >
                    {c.unread}
                  </span>
                )}
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
