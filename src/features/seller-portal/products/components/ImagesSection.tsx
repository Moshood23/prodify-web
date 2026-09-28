import { useRef, useState, type DragEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, ChevronRight, Link2, Star, Trash2, Upload } from 'lucide-react'
import { useProductMutation } from '../hooks'
import { sellerProductsApi } from '../../api/sellerProductsApi'
import { imageSchema, type ImageFormValues } from '../../validation/product.schema'
import { MAX_IMAGES, PHOTO_ACCEPT, checkPhotoFiles, moveItem } from '../photoFiles'
import { ProductImage } from '../../../catalog/components/ProductImage'
import { Button } from '../../../../components/ui/Button'
import { TextField } from '../../../../components/ui/TextField'
import { ErrorAlert } from '../../../../components/ui/Alert'
import { useToastStore } from '../../../../store/toastStore'
import { applyServerFieldErrors, getErrorMessage } from '../../../../services/api/apiError'
import type { ManagedProduct } from '../../../../types/sellerProduct'

interface UploadProgress {
  current: number
  total: number
  percent: number
}

interface UploadResult {
  uploaded: number
  failures: string[]
}

function AddImageLinkForm({ product, onDone }: { product: ManagedProduct; onDone: () => void }) {
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
  const [addingLink, setAddingLink] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [problems, setProblems] = useState<string[]>([])
  const fileInput = useRef<HTMLInputElement>(null)
  const showToast = useToastStore((s) => s.show)

  // Photos go up one at a time, so one bad file doesn't stop the others.
  const upload = useProductMutation(product.id, async (files: File[]): Promise<UploadResult> => {
    const failures: string[] = []
    let uploaded = 0
    for (const [index, file] of files.entries()) {
      setProgress({ current: index + 1, total: files.length, percent: 0 })
      try {
        await sellerProductsApi.uploadImage(product.id, file, (percent) => setProgress({ current: index + 1, total: files.length, percent }))
        uploaded++
      } catch (e) {
        failures.push(`${file.name}: ${getErrorMessage(e, 'Could not upload.')}`)
      }
    }
    return { uploaded, failures }
  })
  const reorder = useProductMutation(product.id, (imageIds: string[]) => sellerProductsApi.reorderImages(product.id, imageIds))
  const remove = useProductMutation(product.id, (imageId: string) => sellerProductsApi.removeImage(product.id, imageId))

  const count = product.images.length
  const slotsLeft = MAX_IMAGES - count
  const busy = upload.isPending || reorder.isPending || remove.isPending

  function startUpload(chosen: FileList | null) {
    if (!chosen || chosen.length === 0 || upload.isPending) return
    const { accepted, problems: found } = checkPhotoFiles(Array.from(chosen), slotsLeft)
    setProblems(found)
    if (accepted.length === 0) return

    upload.mutate(accepted, {
      onSuccess: ({ uploaded, failures }) => {
        setProblems((current) => [...current, ...failures])
        if (uploaded > 0) showToast({ kind: 'success', message: uploaded === 1 ? 'Photo uploaded' : `${uploaded} photos uploaded` })
      },
      onSettled: () => setProgress(null),
    })
  }

  function move(from: number, to: number) {
    const ids = moveItem(
      product.images.map((i) => i.id),
      from,
      to,
    )
    reorder.mutate(ids, {
      onSuccess: () => showToast({ kind: 'success', message: to === 0 ? 'Main photo changed' : 'Photo moved' }),
      onError: (e) => showToast({ kind: 'error', message: getErrorMessage(e) }),
    })
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    startUpload(e.dataTransfer.files)
  }

  return (
    <section
      className="space-y-4 rounded-xl border border-border bg-white p-4"
      onDragOver={(e) => {
        if (slotsLeft > 0 && e.dataTransfer.types.includes('Files')) {
          e.preventDefault()
          setDragging(true)
        }
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false)
      }}
      onDrop={onDrop}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold">Photos</h2>
          <p className="text-sm text-muted">
            The first photo is the main one in the shop. {count}/{MAX_IMAGES} used.
          </p>
          {count > 1 && <p className="text-xs text-muted">Tap the star to make a photo the main one, or the arrows to change the order.</p>}
        </div>
        {slotsLeft > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => fileInput.current?.click()} disabled={upload.isPending}>
              <Upload className="h-4 w-4" aria-hidden /> Upload photos
            </Button>
            {!addingLink && (
              <Button variant="outline" onClick={() => setAddingLink(true)}>
                <Link2 className="h-4 w-4" aria-hidden /> Paste a link
              </Button>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInput}
        type="file"
        accept={PHOTO_ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => {
          startUpload(e.target.files)
          e.target.value = ''
        }}
      />

      {progress && (
        <div className="space-y-1.5 rounded-lg border border-border p-3" role="status">
          <p className="text-sm font-medium">
            Uploading {progress.total === 1 ? 'photo' : `photo ${progress.current} of ${progress.total}`}… {progress.percent}%
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress.percent}%` }} />
          </div>
        </div>
      )}

      {problems.length > 0 && (
        <ErrorAlert>
          {problems.map((problem) => (
            <span key={problem} className="block">
              {problem}
            </span>
          ))}
        </ErrorAlert>
      )}

      {addingLink && <AddImageLinkForm product={product} onDone={() => setAddingLink(false)} />}

      {count > 0 && (
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
                disabled={busy}
                aria-label={`Remove photo ${index + 1}`}
                className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1.5 text-danger shadow hover:bg-white disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
              {count > 1 && (
                <div className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-between gap-1">
                  <button
                    onClick={() => move(index, index - 1)}
                    disabled={busy || index === 0}
                    aria-label={`Move photo ${index + 1} left`}
                    className="rounded-full bg-white/90 p-1.5 shadow hover:bg-white disabled:invisible"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden />
                  </button>
                  {index > 0 && (
                    <button
                      onClick={() => move(index, 0)}
                      disabled={busy}
                      aria-label={`Make photo ${index + 1} the main photo`}
                      title="Make this the main photo"
                      className="rounded-full bg-white/90 p-1.5 text-accent-dark shadow hover:bg-white disabled:opacity-50"
                    >
                      <Star className="h-4 w-4" aria-hidden />
                    </button>
                  )}
                  <button
                    onClick={() => move(index, index + 1)}
                    disabled={busy || index === count - 1}
                    aria-label={`Move photo ${index + 1} right`}
                    className="rounded-full bg-white/90 p-1.5 shadow hover:bg-white disabled:invisible"
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {slotsLeft > 0 && !progress && (
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className={`flex w-full flex-col items-center gap-1 rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
            dragging ? 'border-primary bg-primary-light' : 'border-border hover:border-primary'
          }`}
        >
          <Upload className="h-6 w-6 text-primary" aria-hidden />
          <span className="text-sm font-semibold">{count === 0 ? 'Add your first photos' : 'Add more photos'}</span>
          <span className="text-xs text-muted">Drag photos here or tap to choose. JPG, PNG or WebP, up to 5 MB each.</span>
          {count === 0 && <span className="text-xs text-muted">Products with clear photos sell better.</span>}
        </button>
      )}
    </section>
  )
}