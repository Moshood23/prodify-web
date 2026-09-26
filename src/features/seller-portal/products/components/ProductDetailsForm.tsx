import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, type ProductFormValues } from '../../validation/product.schema'
import { useCategories } from '../../../catalog/hooks/useCatalog'
import { useBrands } from '../hooks'
import { Button } from '../../../../components/ui/Button'
import { TextField } from '../../../../components/ui/TextField'
import { TextArea } from '../../../../components/ui/TextArea'
import { SelectField } from '../../../../components/ui/SelectField'
import { ErrorAlert } from '../../../../components/ui/Alert'
import { applyServerFieldErrors, getErrorMessage } from '../../../../services/api/apiError'
import type { Brand, Category } from '../../../../types/catalog'
import type { ProductInput } from '../../../../types/sellerProduct'

interface ProductDetailsFormProps {
  defaultValues?: ProductFormValues
  submitLabel: string
  isSaving: boolean
  error: unknown
  onSubmit: (product: ProductInput) => Promise<unknown>
}

const fields = ['name', 'description', 'categoryId', 'brandId'] as const

// Name, description, category and brand: used on "Add product" and on the edit page.
// The form waits for the category and brand lists, otherwise the dropdowns can't show
// the product's saved choice when the page is opened directly.
export function ProductDetailsForm(props: ProductDetailsFormProps) {
  const categories = useCategories()
  const brands = useBrands()

  if (categories.error || brands.error) {
    return <ErrorAlert>{getErrorMessage(categories.error ?? brands.error, 'Could not load categories and brands.')}</ErrorAlert>
  }

  if (!categories.data || !brands.data) {
    return <div className="h-72 animate-pulse rounded-lg bg-surface" aria-busy="true" aria-label="Loading form" />
  }

  return <DetailsForm {...props} categories={categories.data} brands={brands.data} />
}

function DetailsForm({
  defaultValues,
  submitLabel,
  isSaving,
  error,
  onSubmit,
  categories,
  brands,
}: ProductDetailsFormProps & { categories: Category[]; brands: Brand[] }) {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    mode: 'onTouched',
    defaultValues: defaultValues ?? { name: '', description: '', categoryId: '', brandId: '' },
  })

  // Sub-categories read as "Phones & Tablets › Phones".
  const categoryOptions = useMemo(() => {
    const byId = new Map(categories.map((c) => [c.id, c]))
    return categories
      .map((c) => {
        const parent = c.parentCategoryId ? byId.get(c.parentCategoryId) : undefined
        return { value: c.id, label: parent ? `${parent.name} › ${c.name}` : c.name }
      })
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [categories])

  const brandOptions = useMemo(
    () => brands.map((b) => ({ value: b.id, label: b.name })).sort((a, b) => a.label.localeCompare(b.label)),
    [brands],
  )

  async function submit(values: ProductFormValues) {
    const product = {
      name: values.name,
      description: values.description || undefined,
      categoryId: values.categoryId,
      brandId: values.brandId || undefined,
    }
    try {
      await onSubmit(product)
      reset(values)
    } catch (e) {
      applyServerFieldErrors(e, fields, setError)
    }
  }

  const hasFieldErrors = fields.some((f) => errors[f])

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      {!!error && !hasFieldErrors && <ErrorAlert>{getErrorMessage(error, 'Could not save the product.')}</ErrorAlert>}

      <TextField label="Product name" placeholder="e.g. Tecno Spark 20 Pro" error={errors.name?.message} {...register('name')} />

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Category"
          placeholder="Choose a category"
          options={categoryOptions}
          error={errors.categoryId?.message}
          {...register('categoryId')}
        />
        <SelectField label="Brand (optional)" placeholder="No brand" options={brandOptions} error={errors.brandId?.message} {...register('brandId')} />
      </div>

      <TextArea
        label="Description"
        rows={5}
        placeholder="What is it, what's in the box, why buy it?"
        error={errors.description?.message}
        {...register('description')}
      />

      <Button type="submit" isLoading={isSaving} disabled={!!defaultValues && !isDirty}>
        {submitLabel}
      </Button>
    </form>
  )
}