import { CategoriesSection } from './CategoriesSection'
import { BrandsSection } from './BrandsSection'

export function AdminCatalogPage() {
  return (
    <div className="max-w-5xl space-y-4">
      <h1 className="text-2xl font-bold">Categories and brands</h1>
      <CategoriesSection />
      <BrandsSection />
    </div>
  )
}