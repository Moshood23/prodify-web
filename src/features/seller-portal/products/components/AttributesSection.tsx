import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X } from 'lucide-react'
import { useProductMutation } from '../hooks'
import { sellerProductsApi } from '../../api/sellerProductsApi'
import { attributesSchema, type AttributesFormValues } from '../../validation/product.schema'
import { Button } from '../../../../components/ui/Button'
import { ErrorAlert } from '../../../../components/ui/Alert'
import { useToastStore } from '../../../../store/toastStore'
import { getErrorMessage } from '../../../../services/api/apiError'
import type { ProductAttribute } from '../../../../types/catalog'
import type { ManagedProduct } from '../../../../types/sellerProduct'

const inputClass = (hasError: boolean) =>
  `w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 ${
    hasError ? 'border-danger focus:ring-red-100' : 'border-border focus:border-primary focus:ring-primary-light'
  }`

// Specifications shown in a table on the product page, e.g. "Battery: 5000mAh".
export function AttributesSection({ product }: { product: ManagedProduct }) {
  const showToast = useToastStore((s) => s.show)
  const save = useProductMutation(product.id, (attributes: ProductAttribute[]) => sellerProductsApi.saveAttributes(product.id, attributes))
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<AttributesFormValues>({
    resolver: zodResolver(attributesSchema),
    defaultValues: { attributes: product.attributes },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'attributes' })

  function submit(values: AttributesFormValues) {
    const attributes = values.attributes.map((a) => ({ name: a.name.trim(), value: a.value.trim() }))
    save.mutate(attributes, {
      onSuccess: () => {
        reset({ attributes })
        showToast({ kind: 'success', message: 'Specifications saved' })
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4 rounded-xl border border-border bg-white p-4">
      <div>
        <h2 className="font-bold">Specifications</h2>
        <p className="text-sm text-muted">Key facts shoppers compare, e.g. Screen size, Battery, Material.</p>
      </div>

      {save.error && <ErrorAlert>{getErrorMessage(save.error, 'Could not save the specifications.')}</ErrorAlert>}
      {errors.attributes?.root?.message && <ErrorAlert>{errors.attributes.root.message}</ErrorAlert>}

      {fields.length > 0 && (
        <ul className="space-y-2">
          {fields.map((field, index) => {
            const fieldErrors = errors.attributes?.[index]
            return (
              <li key={field.id} className="flex items-start gap-2">
                <div className="grid flex-1 gap-2 sm:grid-cols-[12rem_1fr]">
                  <div>
                    <input
                      placeholder="Name"
                      aria-label={`Specification ${index + 1} name`}
                      aria-invalid={fieldErrors?.name ? true : undefined}
                      className={inputClass(!!fieldErrors?.name)}
                      {...register(`attributes.${index}.name`)}
                    />
                    {fieldErrors?.name && <p className="mt-1 text-xs text-danger">{fieldErrors.name.message}</p>}
                  </div>
                  <div>
                    <input
                      placeholder="Value"
                      aria-label={`Specification ${index + 1} value`}
                      aria-invalid={fieldErrors?.value ? true : undefined}
                      className={inputClass(!!fieldErrors?.value)}
                      {...register(`attributes.${index}.value`)}
                    />
                    {fieldErrors?.value && <p className="mt-1 text-xs text-danger">{fieldErrors.value.message}</p>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={`Remove specification ${index + 1}`}
                  className="mt-1.5 rounded-full p-1 text-muted hover:bg-red-50 hover:text-danger"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={() => append({ name: '', value: '' })} disabled={fields.length >= 30}>
          <Plus className="h-4 w-4" aria-hidden /> Add specification
        </Button>
        <Button type="submit" isLoading={save.isPending} disabled={!isDirty}>
          Save specifications
        </Button>
      </div>
    </form>
  )
}