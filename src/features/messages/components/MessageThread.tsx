import { useEffect, useRef } from 'react'
import { EyeOff } from 'lucide-react'
import { formatDateTime } from '../../../lib/format'
import type { Conversation, MessagesViewer } from '../../../types/messages'

// The messages, oldest first. The viewer's own messages sit on the right.
// Prodify's staff see the seller on the right and the customer on the left.
export function MessageThread({ viewer, conversation }: { viewer: MessagesViewer; conversation: Conversation }) {
  const endRef = useRef<HTMLDivElement>(null)
  const count = conversation.messages.length

  // Keep the newest message in view when one arrives.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [count])

  const mineSide = viewer === 'customer' ? 'Customer' : 'Seller'

  return (
    <div className="max-h-[60vh] space-y-3 overflow-y-auto p-4" aria-live="polite">
      {conversation.messages.map((m) => {
        const mine = m.sender === mineSide
        const name = viewer === 'admin' || !mine ? (m.sender === 'Customer' ? conversation.customerName : conversation.sellerName) : 'You'
        return (
          <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2 sm:max-w-[70%] ${mine ? 'bg-primary text-white' : 'bg-surface text-ink'}`}>
              <p className={`text-xs font-semibold ${mine ? 'text-primary-light' : 'text-muted'}`}>{name}</p>
              <p className="whitespace-pre-line break-words text-sm">{m.body}</p>
              <p className={`mt-1 text-[11px] ${mine ? 'text-primary-light' : 'text-muted'}`}>{formatDateTime(m.sentAt)}</p>
              {m.hadContactDetails && (
                <p className={`mt-1 flex items-center gap-1 text-[11px] ${mine ? 'text-primary-light' : 'text-muted'}`}>
                  <EyeOff className="h-3 w-3" aria-hidden /> Contact details were hidden
                </p>
              )}
            </div>
          </div>
        )
      })}
      <div ref={endRef} />
    </div>
  )
}
