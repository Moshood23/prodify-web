import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useCatalogMutation, useManagedBrands } from '../hooks'
import { adminApi, type BrandInput } from '../api/adminApi'
import { brandSchema, type BrandFormValues } from '../validation/catalog.schema'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'
import { ErrorAlert } from '../../../components/ui/Alert'
import { useToastStore } from '../../../store/toastStore'
import { applyServerFieldErrors, getErrorMessage } from '../../../services/api/apiError'
import type { ManagedBrand } from '../../../types/admin'

const fields = ['name', 'description', 'logoUrl'] as const

function BrandForm({ brand, onDone }: { brand?: ManagedBrand; onDone: () => void }) {
  const showToast = useToastStore((s) => s.show)
  const save = useCatalogMutation((input: BrandInput) => (brand ? adminApi.updateBrand(brand.id, input) : adminApi.createBrand(input)))
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    mode: 'onTouched',
    defaultValues: { name: brand?.name ?? '', description: brand?.description ?? '', logoUrl: brand?.logoUrl ?? '' },
  })

  function submit(values: BrandFormValues) {
    save.mutate(
      { name: values.name, description: values.description || undefined, logoUrl: values.logoUrl || undefined },
      {
        onSuccess: () => {
          showToast({ kind: 'success', message: brand ? 'Brand saved' : 'Brand added' })
          onDone()
        },
        onError: (e) => applyServerFieldErrors(e, fields, setError),
      },
    )
  }

  const hasFieldErrors = fields.some((f) => errors[f])

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-3 rounded-lg border border-primary bg-primary-light/40 p-4">
      <h3 className="font-semibold">{brand ? `Edit "${brand.name}"` : 'New brand'}</h3>
      {save.error && !hasFieldErrors && <ErrorAlert>{getErrorMessage(save.error)}</ErrorAlert>}
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField label="Name" error={errors.name?.message} {...register('name')} />
        <TextField label="Logo link (optional)" placeholder="https://…" error={errors.logoUrl?.message} {...register('logoUrl')} />
      </div>
      <TextField label="Description (optional)" error={errors.description?.message} {...register('description')} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" isLoading={save.isPending}>
          {brand ? 'Save changes' : 'Add brand'}
        </Button>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function BrandRow({ brand, onEdit }: { brand: ManagedBrand; onEdit: () => void }) {
  const showToast = useToastStore((s) => s.show)
  const remove = useCatalogMutation(() => adminApi.deleteBrand(brand.id))
  const canDelete = brand.productCount === 0

  return (
    <li className="flex items-center gap-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="font-medium">{brand.name}</p>
        <p className="text-xs text-muted">
          {brand.productCount} {brand.productCount === 1 ? 'product' : 'products'}
        </p>
      </div>
      <div className="flex gap-3 text-sm font-semibold">
        <button onClick={onEdit} className="text-primary hover:underline">
          Edit
        </button>
        <button
          onClick={() =>
            remove.mutate(undefined, {
              onSuccess: () => showToast({ kind: 'success', message: `"${brand.name}" deleted` }),
              onError: (e) => showToast({ kind: 'error', message: getErrorMessage(e) }),
            })
          }
          disabled={!canDelete || remove.isPending}
          title={canDelete ? undefined : 'Only brands no product uses can be deleted'}
          className="text-danger hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
        >
          Delete
        </button>
      </div>
    </li>
  )
}

export function BrandsSection() {
  const { data: brands, isLoading, error } = useManagedBrands()
  const [editing, setEditing] = useState<null | 'new' | ManagedBrand>(null)

  return (
    <section className="space-y-3 rounded-xl border border-border bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold">Brands</h2>
          <p className="text-sm text-muted">Sellers pick from this list. Only unused brands can be deleted.</p>
        </div>
        {!editing && (
          <Button variant="outline" onClick={() => setEditing('new')}>
            <Plus className="h-4 w-4" aria-hidden /> Add brand
          </Button>
        )}
      </div>

      {error && <ErrorAlert>{getErrorMessage(error, 'Could not load brands.')}</ErrorAlert>}
      {editing && <BrandForm key={editing === 'new' ? 'new' : editing.id} brand={editing === 'new' ? undefined : editing} onDone={() => setEditing(null)} />}

      {isLoading ? (
        <div className="h-32 animate-pulse rounded-lg bg-surface" aria-busy="true" aria-label="Loading brands" />
      ) : (
        <ul className="grid divide-y divide-border sm:grid-cols-2 sm:gap-x-6 sm:divide-y-0">
          {(brands ?? []).map((brand) => (
            <BrandRow key={brand.id} brand={brand} onEdit={() => setEditing(brand)} />
          ))}
        </ul>
      )}
    </section>
  )
}