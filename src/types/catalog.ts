// Shapes returned by the catalog endpoints of the API.

export interface PaginatedList<T> {
  items: T[]
  pageNumber: number
  totalPages: number
  totalCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

// GET /api/products
export interface ProductSummary {
  id: string
  name: string
  categoryId: string
  categoryName: string
  brandName: string | null
  sellerId: string
  sellerName: string
  price: number
  compareAtPrice: number | null
  imageUrl: string | null
  defaultVariantId: string
  variantCount: number
  inStock: boolean
  createdAt: string
}

// GET /api/products/{id}
export interface ProductDetails {
  id: string
  name: string
  description: string | null
  isActive: boolean
  categoryId: string
  categoryName: string
  brandId: string | null
  brandName: string | null
  sellerId: string
  sellerName: string
  images: ProductImage[]
  variants: ProductVariant[]
  attributes: ProductAttribute[]
}

export interface ProductImage {
  id: string
  url: string
  altText: string | null
  displayOrder: number
}

export interface ProductVariant {
  id: string
  sku: string
  name: string | null
  price: number
  compareAtPrice: number | null
  availableQuantity: number
  inStock: boolean
}

export interface ProductAttribute {
  name: string
  value: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  parentCategoryId: string | null
}

export interface Brand {
  id: string
  name: string
  logoUrl: string | null
}

export type ProductSort = 'newest' | 'price_asc' | 'price_desc' | 'name'

export interface ProductQuery {
  search?: string
  categoryId?: string
  brandId?: string
  minPrice?: number
  maxPrice?: number
  sort?: ProductSort
  pageNumber?: number
  pageSize?: number
}