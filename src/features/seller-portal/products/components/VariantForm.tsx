import { useForm, type FieldError, type UseFormRegisterReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  newVariantSchema,
  toVariantInput,
  variantSchema,
  type NewVariantFormValues,
  type VariantFormValues,
} from '../../validation/product.schema'
import { Button } from '../../../../components/ui/Button'
import { TextField } from '../../../../components/ui/TextField'
import { ErrorAlert } from '../../../../components/ui/Alert'
import { applyServerFieldErrors, getErrorMessage } from '../../../../services/api/apiError'
import type { ManagedVariant, NewVariantInput, VariantInput } from '../../../../types/sellerProduct'

const newFields = ['sku', 'name', 'price', 'compareAtPrice', 'weight', 'initialStock'] as const
const editFields = ['name', 'price', 'compareAtPrice', 'weight'] as const

interface SharedProps {
  isSaving: boolean
  error: unknown
  onCancel: () => void
}

type PriceField = 'price' | 'compareAtPrice' | 'weight'

// Shared by both forms: each form passes its own register() results and errors.
function PriceAndWeightFields({
  fields,
  errors,
}: {
  fields: Record<PriceField, UseFormRegisterReturn>
  errors: Partial<Record<PriceField, FieldError>>
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <TextField label="Price (₦)" inputMode="decimal" placeholder="25000" error={errors.price?.message} {...fields.price} />
      <TextField
        label="Old price (₦, optional)"
        inputMode="decimal"
        hint="Shown crossed out to show a discount."
        error={errors.compareAtPrice?.message}
        {...fields.compareAtPrice}
      />
      <TextField label="Weight (kg)" inputMode="decimal" placeholder="0.5" error={errors.weight?.message} {...fields.weight} />
    </div>
  )
}

export function NewVariantForm({ isSaving, error, onCancel, onSubmit }: SharedProps & { onSubmit: (variant: NewVariantInput) => Promise<unknown> }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<NewVariantFormValues>({
    resolver: zodResolver(newVariantSchema),
    mode: 'onTouched',
    defaultValues: { sku: '', name: '', price: '', compareAtPrice: '', weight: '', initialStock: '0' },
  })

  async function submit(values: NewVariantFormValues) {
    try {
      await onSubmit({ ...toVariantInput(values), sku: values.sku, initialStock: Number(values.initialStock) })
    } catch (e) {
      applyServerFieldErrors(e, newFields, setError)
    }
  }

  const hasFieldErrors = newFields.some((f) => errors[f])

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4 rounded-lg border border-primary bg-primary-light/40 p-4">
      <h3 className="font-semibold">New variant</h3>
      {!!error && !hasFieldErrors && <ErrorAlert>{getErrorMessage(error, 'Could not add the variant.')}</ErrorAlert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Option name (optional)"
          placeholder="e.g. Black, Size 42, 128GB"
          hint="Leave empty if the product has only one option."
          error={errors.name?.message}
          {...register('name')}
        />
        <TextField
          label="SKU"
          placeholder="e.g. FAN-16-BLK"
          hint="Your own unique code for this item. It can't be changed later."
          error={errors.sku?.message}
          {...register('sku')}
        />
      </div>
      <PriceAndWeightFields
        fields={{ price: register('price'), compareAtPrice: register('compareAtPrice'), weight: register('weight') }}
        errors={errors}
      />
      <TextField label="Units in stock" inputMode="numeric" className="sm:w-1/3" error={errors.initialStock?.message} {...register('initialStock')} />
      <div className="flex flex-wrap gap-3">
        <Button type="submit" isLoading={isSaving}>
          Add variant
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export function EditVariantForm({
  variant,
  isSaving,
  error,
  onCancel,
  onSubmit,
}: SharedProps & { variant: ManagedVariant; onSubmit: (variant: VariantInput) => Promise<unknown> }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema),
    mode: 'onTouched',
    defaultValues: {
      name: variant.name ?? '',
      price: String(variant.price),
      compareAtPrice: variant.compareAtPrice === null ? '' : String(variant.compareAtPrice),
      weight: variant.weight ? String(variant.weight) : '',
    },
  })

  async function submit(values: VariantFormValues) {
    try {
      await onSubmit(toVariantInput(values))
    } catch (e) {
      applyServerFieldErrors(e, editFields, setError)
    }
  }

  const hasFieldErrors = editFields.some((f) => errors[f])

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      {!!error && !hasFieldErrors && <ErrorAlert>{getErrorMessage(error, 'Could not save the variant.')}</ErrorAlert>}
      <TextField label="Option name (optional)" placeholder="e.g. Black, Size 42, 128GB" error={errors.name?.message} {...register('name')} />
      <PriceAndWeightFields
        fields={{ price: register('price'), compareAtPrice: register('compareAtPrice'), weight: register('weight') }}
        errors={errors}
      />
      <p className="text-xs text-muted">Orders already placed keep the price they were bought at.</p>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" isLoading={isSaving} disabled={!isDirty}>
          Save changes
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}