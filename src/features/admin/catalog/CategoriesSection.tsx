import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CornerDownRight, Plus } from 'lucide-react'
import { useCatalogMutation, useManagedCategories } from '../hooks'
import { adminApi, type CategoryInput } from '../api/adminApi'
import { categorySchema, type CategoryFormValues } from '../validation/catalog.schema'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'
import { SelectField } from '../../../components/ui/SelectField'
import { ErrorAlert } from '../../../components/ui/Alert'
import { useToastStore } from '../../../store/toastStore'
import { applyServerFieldErrors, getErrorMessage } from '../../../services/api/apiError'
import type { ManagedCategory } from '../../../types/admin'

const fields = ['name', 'description', 'parentCategoryId'] as const

function CategoryForm({ category, categories, onDone }: { category?: ManagedCategory; categories: ManagedCategory[]; onDone: () => void }) {
  const showToast = useToastStore((s) => s.show)
  const save = useCatalogMutation((input: CategoryInput) => (category ? adminApi.updateCategory(category.id, input) : adminApi.createCategory(input)))
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    mode: 'onTouched',
    defaultValues: { name: category?.name ?? '', description: category?.description ?? '', parentCategoryId: category?.parentCategoryId ?? '' },
  })

  // Only top-level categories can be parents (two levels at most).
  const parentOptions = categories
    .filter((c) => c.parentCategoryId === null && c.id !== category?.id)
    .map((c) => ({ value: c.id, label: c.name }))

  function submit(values: CategoryFormValues) {
    save.mutate(
      { name: values.name, description: values.description || undefined, parentCategoryId: values.parentCategoryId || undefined },
      {
        onSuccess: () => {
          showToast({ kind: 'success', message: category ? 'Category saved' : 'Category added' })
          onDone()
        },
        onError: (e) => applyServerFieldErrors(e, fields, setError),
      },
    )
  }

  const hasFieldErrors = fields.some((f) => errors[f])

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-3 rounded-lg border border-primary bg-primary-light/40 p-4">
      <h3 className="font-semibold">{category ? `Edit "${category.name}"` : 'New category'}</h3>
      {save.error && !hasFieldErrors && <ErrorAlert>{getErrorMessage(save.error)}</ErrorAlert>}
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField label="Name" error={errors.name?.message} {...register('name')} />
        <SelectField
          label="Inside"
          placeholder="Nothing (top-level category)"
          options={parentOptions}
          disabled={!!category && category.subCategoryCount > 0}
          error={errors.parentCategoryId?.message}
          {...register('parentCategoryId')}
        />
      </div>
      <TextField label="Description (optional)" error={errors.description?.message} {...register('description')} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" isLoading={save.isPending}>
          {category ? 'Save changes' : 'Add category'}
        </Button>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function CategoryRow({ category, isChild, onEdit }: { category: ManagedCategory; isChild: boolean; onEdit: () => void }) {
  const showToast = useToastStore((s) => s.show)
  const remove = useCatalogMutation(() => adminApi.deleteCategory(category.id))
  const canDelete = category.productCount === 0 && category.subCategoryCount === 0

  return (
    <li className={`flex flex-wrap items-center gap-3 py-2.5 ${isChild ? 'pl-6' : ''}`}>
      {isChild && <CornerDownRight className="h-4 w-4 text-muted" aria-hidden />}
      <div className="min-w-0 flex-1">
        <p className={isChild ? 'text-sm' : 'font-semibold'}>{category.name}</p>
        <p className="text-xs text-muted">
          {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
          {category.subCategoryCount > 0 && ` · ${category.subCategoryCount} sub-categories`}
        </p>
      </div>
      <div className="flex gap-3 text-sm font-semibold">
        <button onClick={onEdit} className="text-primary hover:underline">
          Edit
        </button>
        <button
          onClick={() =>
            remove.mutate(undefined, {
              onSuccess: () => showToast({ kind: 'success', message: `"${category.name}" deleted` }),
              onError: (e) => showToast({ kind: 'error', message: getErrorMessage(e) }),
            })
          }
          disabled={!canDelete || remove.isPending}
          title={canDelete ? undefined : 'Only empty categories can be deleted'}
          className="text-danger hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
        >
          Delete
        </button>
      </div>
    </li>
  )
}

export function CategoriesSection() {
  const { data: categories, isLoading, error } = useManagedCategories()
  // null = no form, 'new' = adding, otherwise the category being edited.
  const [editing, setEditing] = useState<null | 'new' | ManagedCategory>(null)

  // Top-level categories, each followed by its sub-categories.
  const tree = useMemo(() => {
    const all = categories ?? []
    return all
      .filter((c) => c.parentCategoryId === null)
      .map((parent) => ({ parent, children: all.filter((c) => c.parentCategoryId === parent.id) }))
  }, [categories])

  return (
    <section className="space-y-3 rounded-xl border border-border bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold">Categories</h2>
          <p className="text-sm text-muted">Two levels, e.g. Phones &amp; Tablets › Phones. Only empty categories can be deleted.</p>
        </div>
        {!editing && (
          <Button variant="outline" onClick={() => setEditing('new')}>
            <Plus className="h-4 w-4" aria-hidden /> Add category
          </Button>
        )}
      </div>

      {error && <ErrorAlert>{getErrorMessage(error, 'Could not load categories.')}</ErrorAlert>}
      {editing && categories && (
        <CategoryForm
          key={editing === 'new' ? 'new' : editing.id}
          category={editing === 'new' ? undefined : editing}
          categories={categories}
          onDone={() => setEditing(null)}
        />
      )}

      {isLoading ? (
        <div className="h-32 animate-pulse rounded-lg bg-surface" aria-busy="true" aria-label="Loading categories" />
      ) : (
        <ul className="divide-y divide-border">
          {tree.map(({ parent, children }) => (
            <li key={parent.id}>
              <ul className="divide-y divide-border">
                <CategoryRow category={parent} isChild={false} onEdit={() => setEditing(parent)} />
                {children.map((child) => (
                  <CategoryRow key={child.id} category={child} isChild onEdit={() => setEditing(child)} />
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}