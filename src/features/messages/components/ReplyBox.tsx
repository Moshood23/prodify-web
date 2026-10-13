import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import { useReply } from '../hooks'
import { Button } from '../../../components/ui/Button'
import { getErrorMessage } from '../../../services/api/apiError'

// Same limit as the API (ConversationMessage.MaxLength).
const MAX_LENGTH = 2000

export function ReplyBox({ viewer, conversationId }: { viewer: 'customer' | 'seller'; conversationId: string }) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string>()
  const reply = useReply(viewer, conversationId)

  function send(e?: FormEvent) {
    e?.preventDefault()
    if (!text.trim()) return
    setError(undefined)
    reply.mutate(text.trim(), {
      onSuccess: () => setText(''),
      onError: (err) => setError(getErrorMessage(err, 'Could not send your message.')),
    })
  }

  // Enter sends, Shift+Enter starts a new line.
  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <form onSubmit={send} className="space-y-2 border-t border-border p-4">
      <div className="flex items-end gap-2">
        <label htmlFor="reply" className="sr-only">
          Your message
        </label>
        <textarea
          id="reply"
          rows={2}
          maxLength={MAX_LENGTH}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Write a message"
          className="min-h-11 flex-1 resize-y rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
        />
        <Button type="submit" isLoading={reply.isPending} disabled={!text.trim()} aria-label="Send">
          <Send className="h-4 w-4" aria-hidden />
        </Button>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <p className="text-xs text-muted">Phone numbers and email addresses are hidden. Keep your payments on Prodify so you're protected.</p>
    </form>
  )
}
