import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImagePlus, Trash2 } from 'lucide-react'
import { useProductMutation } from '../hooks'
import { sellerProductsApi } from '../../api/sellerProductsApi'
import { imageSchema, type ImageFormValues } from '../../validation/product.schema'
import { ProductImage } from '../../../catalog/components/ProductImage'
import { Button } from '../../../../components/ui/Button'
import { TextField } from '../../../../components/ui/TextField'
import { ErrorAlert } from '../../../../components/ui/Alert'
import { useToastStore } from '../../../../store/toastStore'
import { applyServerFieldErrors, getErrorMessage } from '../../../../services/api/apiError'
import type { ManagedProduct } from '../../../../types/sellerProduct'

const MAX_IMAGES = 10

function AddImageForm({ product, onDone }: { product: ManagedProduct; onDone: () => void }) {
  const showToast = useToastStore((s) => s.show)
  const add = useProductMutation(product.id, (image: { url: string; altText?: string }) => sellerProductsApi.addImage(product.id, image))
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ImageFormValues>({ resolver: zodResolver(imageSchema), mode: 'onTouched', defaultValues: { url: '', altText: '' } })

  function submit(values: ImageFormValues) {
    add.mutate(
      { url: values.url, altText: values.altText || undefined },
      {
        onSuccess: () => {
          showToast({ kind: 'success', message: 'Photo added' })
          onDone()
        },
        onError: (e) => applyServerFieldErrors(e, ['url', 'altText'] as const, setError),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-3 rounded-lg border border-primary bg-primary-light/40 p-4">
      {add.error && !errors.url && !errors.altText && <ErrorAlert>{getErrorMessage(add.error, 'Could not add the photo.')}</ErrorAlert>}
      <TextField
        label="Photo link"
        placeholder="https://…"
        hint="Paste a link to a photo that is already online. Square photos look best."
        error={errors.url?.message}
        {...register('url')}
      />
      <TextField label="Short description (optional)" placeholder="e.g. Front view, black" error={errors.altText?.message} {...register('altText')} />
      <div className="flex flex-wrap gap-3">
        <Button type="submit" isLoading={add.isPending}>
          Add photo
        </Button>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export function ImagesSection({ product }: { product: ManagedProduct }) {
  const [adding, setAdding] = useState(false)
  const showToast = useToastStore((s) => s.show)
  const remove = useProductMutation(product.id, (imageId: string) => sellerProductsApi.removeImage(product.id, imageId))

  const canAdd = product.images.length < MAX_IMAGES

  return (
    <section className="space-y-4 rounded-xl border border-border bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold">Photos</h2>
          <p className="text-sm text-muted">
            The first photo is the main one in the shop. {product.images.length}/{MAX_IMAGES} used.
          </p>
        </div>
        {!adding && canAdd && (
          <Button variant="outline" onClick={() => setAdding(true)}>
            <ImagePlus className="h-4 w-4" aria-hidden /> Add photo
          </Button>
        )}
      </div>

      {adding && <AddImageForm product={product} onDone={() => setAdding(false)} />}

      {product.images.length === 0 ? (
        !adding && <p className="text-sm text-muted">No photos yet. Products with clear photos sell better.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {product.images.map((image, index) => (
            <li key={image.id} className="relative overflow-hidden rounded-lg border border-border">
              <ProductImage src={image.url} alt={image.altText ?? product.name} className="aspect-square w-full" />
              {index === 0 && <span className="absolute left-1.5 top-1.5 rounded bg-primary px-1.5 py-0.5 text-xs font-semibold text-white">Main</span>}
              <button
                onClick={() =>
                  remove.mutate(image.id, {
                    onSuccess: () => showToast({ kind: 'success', message: 'Photo removed' }),
                    onError: (e) => showToast({ kind: 'error', message: getErrorMessage(e) }),
                  })
                }
                disabled={remove.isPending}
                aria-label={`Remove photo ${index + 1}`}
                className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1.5 text-danger shadow hover:bg-white disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}