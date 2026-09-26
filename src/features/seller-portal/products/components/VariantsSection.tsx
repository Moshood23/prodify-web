import { useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { useProductMutation } from '../hooks'
import { sellerProductsApi } from '../../api/sellerProductsApi'
import { stockSchema } from '../../validation/product.schema'
import { EditVariantForm, NewVariantForm } from './VariantForm'
import { Button } from '../../../../components/ui/Button'
import { useToastStore } from '../../../../store/toastStore'
import { getErrorMessage } from '../../../../services/api/apiError'
import { formatNaira } from '../../../../lib/format'
import type { ManagedProduct, ManagedVariant, NewVariantInput, VariantInput } from '../../../../types/sellerProduct'

// "Units ready to sell" with its own Save button.
function StockEditor({ productId, variant }: { productId: string; variant: ManagedVariant }) {
  const [value, setValue] = useState(String(variant.availableQuantity))
  const [error, setError] = useState<string>()
  const showToast = useToastStore((s) => s.show)
  const save = useProductMutation(productId, (quantity: number) => sellerProductsApi.setStock(productId, variant.id, quantity))

  const changed = value.trim() !== String(variant.availableQuantity)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const result = stockSchema.safeParse(value)
    if (!result.success) {
      setError(result.error.issues[0]?.message)
      return
    }
    setError(undefined)
    save.mutate(Number(result.data), {
      onSuccess: () => showToast({ kind: 'success', message: `Stock updated for ${variant.name ?? variant.sku}` }),
      onError: (e) => setError(getErrorMessage(e, 'Could not update stock.')),
    })
  }

  const inputId = `stock-${variant.id}`

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-1">
      <label htmlFor={inputId} className="block text-xs text-muted">
        Units ready to sell
      </label>
      <div className="flex items-center gap-2">
        <input
          id={inputId}
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={error ? true : undefined}
          className={`w-24 rounded-lg border bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 ${
            error ? 'border-danger focus:ring-red-100' : 'border-border focus:border-primary focus:ring-primary-light'
          }`}
        />
        <Button type="submit" variant="outline" className="px-3 py-1.5" isLoading={save.isPending} disabled={!changed}>
          Save
        </Button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      {variant.quantityReserved > 0 && (
        <p className="text-xs text-muted">+ {variant.quantityReserved} held for orders awaiting payment</p>
      )}
    </form>
  )
}

function VariantRow({ product, variant }: { product: ManagedProduct; variant: ManagedVariant }) {
  const [editing, setEditing] = useState(false)
  const showToast = useToastStore((s) => s.show)
  const update = useProductMutation(product.id, (input: VariantInput) => sellerProductsApi.updateVariant(product.id, variant.id, input))
  const setActive = useProductMutation(product.id, (isActive: boolean) => sellerProductsApi.setVariantActive(product.id, variant.id, isActive))

  function toggleActive() {
    setActive.mutate(!variant.isActive, {
      onSuccess: () => showToast({ kind: 'success', message: variant.isActive ? 'Variant hidden from the shop' : 'Variant is on sale again' }),
      onError: (e) => showToast({ kind: 'error', message: getErrorMessage(e) }),
    })
  }

  return (
    <li className={`space-y-3 p-4 ${variant.isActive ? '' : 'bg-surface'}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 font-semibold">
            {variant.name ?? 'Standard'}
            {!variant.isActive && <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-muted">Not on sale</span>}
          </p>
          <p className="text-xs text-muted">SKU {variant.sku}</p>
          <p className="mt-1 text-sm">
            <span className="font-semibold">{formatNaira(variant.price)}</span>
            {variant.compareAtPrice !== null && <span className="ml-2 text-muted line-through">{formatNaira(variant.compareAtPrice)}</span>}
            {variant.weight > 0 && <span className="ml-2 text-muted">· {variant.weight} kg</span>}
          </p>
        </div>

        {/* A new key after each save resets the input to the saved number. */}
        <StockEditor key={variant.availableQuantity} productId={product.id} variant={variant} />
      </div>

      {editing ? (
        <EditVariantForm
          variant={variant}
          isSaving={update.isPending}
          error={update.error}
          onCancel={() => setEditing(false)}
          onSubmit={(input) =>
            update.mutateAsync(input).then(() => {
              setEditing(false)
              showToast({ kind: 'success', message: 'Variant saved' })
            })
          }
        />
      ) : (
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
          <button
            onClick={() => {
              update.reset()
              setEditing(true)
            }}
            className="text-primary hover:underline"
          >
            Edit price or name
          </button>
          <button onClick={toggleActive} disabled={setActive.isPending} className="text-primary hover:underline disabled:opacity-50">
            {variant.isActive ? 'Stop selling' : 'Sell again'}
          </button>
        </div>
      )}
    </li>
  )
}

export function VariantsSection({ product }: { product: ManagedProduct }) {
  const [adding, setAdding] = useState(false)
  const showToast = useToastStore((s) => s.show)
  const add = useProductMutation(product.id, (variant: NewVariantInput) => sellerProductsApi.addVariant(product.id, variant))

  return (
    <section className="rounded-xl border border-border bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <div>
          <h2 className="font-bold">Variants and stock</h2>
          <p className="text-sm text-muted">Each variant is one option a customer can buy, e.g. a size or colour.</p>
        </div>
        {!adding && (
          <Button
            variant="outline"
            onClick={() => {
              add.reset()
              setAdding(true)
            }}
          >
            <Plus className="h-4 w-4" aria-hidden /> Add variant
          </Button>
        )}
      </div>

      {adding && (
        <div className="border-b border-border p-4">
          <NewVariantForm
            isSaving={add.isPending}
            error={add.error}
            onCancel={() => setAdding(false)}
            onSubmit={(variant) =>
              add.mutateAsync(variant).then(() => {
                setAdding(false)
                showToast({ kind: 'success', message: 'Variant added' })
              })
            }
          />
        </div>
      )}

      {product.variants.length === 0 ? (
        !adding && (
          <p className="p-6 text-center text-sm text-muted">
            Add at least one variant with a price and stock. Until then, shoppers can't see this product.
          </p>
        )
      ) : (
        <ul className="divide-y divide-border">
          {product.variants.map((variant) => (
            <VariantRow key={variant.id} product={product} variant={variant} />
          ))}
        </ul>
      )}
    </section>
  )
}