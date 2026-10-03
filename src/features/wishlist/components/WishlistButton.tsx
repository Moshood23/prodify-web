import { Heart } from 'lucide-react'
import { useWishlistToggle } from '../hooks'

interface WishlistButtonProps {
  productId: string
  productName: string
  // "icon": a round heart over a product photo. "button": a heart with a label.
  variant?: 'icon' | 'button'
}

export function WishlistButton({ productId, productName, variant = 'icon' }: WishlistButtonProps) {
  const { saved, toggle, isPending } = useWishlistToggle(productId, productName)
  const label = saved ? `Remove ${productName} from saved items` : `Save ${productName}`
  const heart = <Heart className={`h-5 w-5 ${saved ? 'fill-danger text-danger' : ''}`} aria-hidden />

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        aria-pressed={saved}
        aria-label={label}
        className="flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold hover:border-primary disabled:opacity-60"
      >
        {heart}
        <span>{saved ? 'Saved' : 'Save'}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-pressed={saved}
      aria-label={label}
      title={saved ? 'Saved' : 'Save for later'}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow hover:bg-white disabled:opacity-60"
    >
      {heart}
    </button>
  )
}
