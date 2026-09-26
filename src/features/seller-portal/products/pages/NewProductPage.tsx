import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useCreateProduct } from '../hooks'
import { ProductDetailsForm } from '../components/ProductDetailsForm'
import { useToastStore } from '../../../../store/toastStore'

export function NewProductPage() {
  const navigate = useNavigate()
  const showToast = useToastStore((s) => s.show)
  const create = useCreateProduct()

  return (
    <div className="max-w-3xl space-y-4">
      <Link to="/seller/products" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Products
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Add a product</h1>
        <p className="text-sm text-muted">Step 1 of 2: the basics. Next you'll add photos, prices and stock.</p>
      </div>

      <section className="rounded-xl border border-border bg-white p-4 sm:p-6">
        <ProductDetailsForm
          submitLabel="Save and continue"
          isSaving={create.isPending}
          error={create.error}
          onSubmit={(product) =>
            create.mutateAsync(product).then((id) => {
              showToast({ kind: 'success', message: 'Product saved. Now add a variant with its price and stock.' })
              navigate(`/seller/products/${id}`, { replace: true })
            })
          }
        />
      </section>
    </div>
  )
}