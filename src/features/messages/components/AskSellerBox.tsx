import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { useStartConversation } from '../hooks'
import { useAuthStore } from '../../../store/authStore'
import { Button } from '../../../components/ui/Button'
import { TextArea } from '../../../components/ui/TextArea'
import { getErrorMessage } from '../../../services/api/apiError'

interface AskSellerBoxProps {
  // About a product, or about an order (then also which seller).
  productId?: string
  orderId?: string
  sellerId?: string
  sellerName: string
  label: string
  placeholder: string
}

// "Ask the seller" on a product page, "Message seller" on an order. Opens the conversation once sent.
export function AskSellerBox({ productId, orderId, sellerId, sellerName, label, placeholder }: AskSellerBoxProps) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  const navigate = useNavigate()
  const start = useStartConversation()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [error, setError] = useState<string>()

  if (!user) {
    return (
      <Link
        to={`/login?returnTo=${encodeURIComponent(location.pathname)}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        <MessageSquare className="h-4 w-4" aria-hidden /> Log in to {label.toLowerCase()}
      </Link>
    )
  }

  // Sellers and admins can't start conversations.
  if (!user.roles.includes('Customer')) return null

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!text.trim()) return setError('Write your question.')
    setError(undefined)
    start.mutate(
      { productId, orderId, sellerId, message: text.trim() },
      {
        onSuccess: (id) => navigate(`/account/messages/${id}`),
        onError: (err) => setError(getErrorMessage(err, 'Could not send your message.')),
      },
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        <MessageSquare className="h-4 w-4" aria-hidden /> {label}
      </button>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-2 rounded-lg border border-border bg-white p-3">
      <TextArea
        label={`Message to ${sellerName}`}
        rows={3}
        maxLength={2000}
        placeholder={placeholder}
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setError(undefined)
        }}
        error={error}
        autoFocus
      />
      <p className="text-xs text-muted">Phone numbers and email addresses are hidden. Keep your payments on Prodify so you're protected.</p>
      <div className="flex gap-2">
        <Button type="submit" isLoading={start.isPending}>
          Send
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={start.isPending}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
