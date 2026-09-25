import { useState } from 'react'
import { ImageOff } from 'lucide-react'

interface ProductImageProps {
  src: string | null | undefined
  alt: string
  className?: string
}

// Shows a neutral placeholder when there is no image or it fails to load.
export function ProductImage({ src, alt, className = '' }: ProductImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  if (!src || failedSrc === src) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 text-slate-400 ${className}`} role="img" aria-label={alt}>
        <ImageOff className="h-8 w-8" aria-hidden />
      </div>
    )
  }

  return (
    <img src={src} alt={alt} loading="lazy" onError={() => setFailedSrc(src)} className={`bg-slate-100 object-cover ${className}`} />
  )
}