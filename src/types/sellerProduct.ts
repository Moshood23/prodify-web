// Seller Centre view of products (GET /api/products/manage, /api/products/{id}/manage).
import type { ProductAttribute, ProductImage } from './catalog'

// Live: shoppers can buy it. OutOfStock: visible, nothing left to sell.
// Incomplete: no active variant yet, so hidden. Inactive: switched off, so hidden.
export type ManagedProductStatus = 'Live' | 'OutOfStock' | 'Incomplete' | 'Inactive'

export interface ManagedProductSummary {
  id: string
  name: string
  categoryName: string
  brandName: string | null
  imageUrl: string | null
  isActive: boolean
  activeVariantCount: number
  price: number | null
  availableStock: number
  status: ManagedProductStatus
  createdAt: string
}

export interface ManagedProduct {
  id: string
  name: string
  description: string | null
  isActive: boolean
  status: ManagedProductStatus
  categoryId: string
  categoryName: string
  brandId: string | null
  brandName: string | null
  sellerId: string
  sellerName: string
  createdAt: string
  images: ProductImage[]
  attributes: ProductAttribute[]
  variants: ManagedVariant[]
}

export interface ManagedVariant {
  id: string
  sku: string
  name: string | null
  price: number
  compareAtPrice: number | null
  weight: number
  isActive: boolean
  quantityOnHand: number
  // Held for orders that are not paid or confirmed yet.
  quantityReserved: number
  availableQuantity: number
}

export type ManagedProductFilter = 'active' | 'inactive'

export interface ManagedProductQuery {
  search?: string
  filter?: ManagedProductFilter
  pageNumber?: number
  pageSize?: number
}

export interface ProductInput {
  name: string
  description?: string
  categoryId: string
  brandId?: string
}

export interface VariantInput {
  name?: string
  price: number
  compareAtPrice?: number
  weight: number
}

export interface NewVariantInput extends VariantInput {
  sku: string
  initialStock: number
}