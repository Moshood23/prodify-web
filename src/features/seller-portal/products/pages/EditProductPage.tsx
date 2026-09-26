import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { useManagedProduct, useProductMutation } from '../hooks'
import { sellerProductsApi } from '../../api/sellerProductsApi'
import { ProductStatusBadge } from '../components/ProductStatusBadge'
import { ProductDetailsForm } from '../components/ProductDetailsForm'
import { VariantsSection } from '../components/VariantsSection'
import { ImagesSection } from '../components/ImagesSection'
import { AttributesSection } from '../components/AttributesSection'
import { Button } from '../../../../components/ui/Button'
import { ErrorAlert } from '../../../../components/ui/Alert'
import { useToastStore } from '../../../../store/toastStore'
import { getErrorMessage, getErrorStatus } from '../../../../services/api/apiError'
import type { ManagedProduct, ProductInput } from '../../../../types/sellerProduct'

const statusHelp: Record<ManagedProduct['status'], string> = {
  Live: 'Shoppers can see and buy this product.',
  OutOfStock: 'Shoppers can see this product but cannot buy it until you add stock.',
  Incomplete: 'Hidden from shoppers until you add a variant with a price.',
  Inactive: 'You have hidden this product. Shoppers cannot see it.',
}

function ProductHeader({ product }: { product: ManagedProduct }) {
  const showToast = useToastStore((s) => s.show)
  const setActive = useProductMutation(product.id, (isActive: boolean) => sellerProductsApi.setActive(product.id, isActive))
  const isVisible = product.status === 'Live' || product.status === 'OutOfStock'

  function toggle() {
    setActive.mutate(!product.isActive, {
      onSuccess: () => showToast({ kind: 'success', message: product.isActive ? 'Product hidden from the shop' : 'Product is back in the shop' }),
      onError: (e) => showToast({ kind: 'error', message: getErrorMessage(e) }),
    })
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold">
          <span className="break-words">{product.name}</span>
          <ProductStatusBadge status={product.status} />
        </h1>
        <p className="mt-1 text-sm text-muted">{statusHelp[product.status]}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {isVisible && (
          <Link to={`/products/${product.id}`} target="_blank" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            View in shop <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </Link>
        )}
        <Button variant={product.isActive ? 'outline' : 'primary'} isLoading={setActive.isPending} onClick={toggle}>
          {product.isActive ? 'Hide from shop' : 'Show in shop'}
        </Button>
      </div>
    </div>
  )
}

function DetailsSection({ product }: { product: ManagedProduct }) {
  const showToast = useToastStore((s) => s.show)
  const update = useProductMutation(product.id, (input: ProductInput) => sellerProductsApi.update(product.id, input))

  return (
    <section className="space-y-4 rounded-xl border border-border bg-white p-4">
      <h2 className="font-bold">Details</h2>
      <ProductDetailsForm
        defaultValues={{
          name: product.name,
          description: product.description ?? '',
          categoryId: product.categoryId,
          brandId: product.brandId ?? '',
        }}
        submitLabel="Save details"
        isSaving={update.isPending}
        error={update.error}
        onSubmit={(input) => update.mutateAsync(input).then(() => showToast({ kind: 'success', message: 'Details saved' }))}
      />
    </section>
  )
}

export function EditProductPage() {
  const { productId } = useParams()
  const { data: product, isLoading, error } = useManagedProduct(productId)

  return (
    <div className="max-w-4xl space-y-4">
      <Link to="/seller/products" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Products
      </Link>

      {isLoading && <div className="h-64 animate-pulse rounded-xl bg-white" aria-busy="true" aria-label="Loading product" />}
      {error && (
        <ErrorAlert>{getErrorStatus(error) === 404 ? 'This product does not exist or is not yours.' : getErrorMessage(error, 'Could not load the product.')}</ErrorAlert>
      )}

      {product && (
        <>
          <ProductHeader product={product} />
          <VariantsSection product={product} />
          <ImagesSection product={product} />
          <DetailsSection product={product} />
          {/* Remounts after a save elsewhere changes the saved list. */}
          <AttributesSection key={JSON.stringify(product.attributes)} product={product} />
        </>
      )}
    </div>
  )
}