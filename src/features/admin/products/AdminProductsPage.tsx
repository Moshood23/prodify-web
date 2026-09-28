import { AdminProductList } from './AdminProductList'

export function AdminProductsPage() {
  return (
    <div className="max-w-6xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-sm text-muted">Every seller's products. Hide anything that breaks the rules; sellers see it as hidden.</p>
      </div>
      <AdminProductList />
    </div>
  )
}