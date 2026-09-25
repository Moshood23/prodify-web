import { useState } from 'react'
import type { ProductImage as ProductImageData } from '../../../types/catalog'
import { ProductImage } from './ProductImage'

export function ImageGallery({ images, productName }: { images: ProductImageData[]; productName: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selected = images[selectedIndex] ?? images[0]

  return (
    <div className="space-y-3">
      <ProductImage src={selected?.url} alt={selected?.altText ?? productName} className="aspect-square w-full rounded-xl" />

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              aria-label={`Show image ${index + 1}`}
              aria-current={index === selectedIndex ? 'true' : undefined}
              className={`shrink-0 overflow-hidden rounded-lg border-2 ${index === selectedIndex ? 'border-primary' : 'border-transparent hover:border-border'}`}
            >
              <ProductImage src={image.url} alt="" className="h-16 w-16" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}