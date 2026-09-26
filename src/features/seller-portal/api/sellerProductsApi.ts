import apiClient from '../../../services/api/apiClient'
import type { PaginatedList, ProductAttribute } from '../../../types/catalog'
import type {
  ManagedProduct,
  ManagedProductQuery,
  ManagedProductSummary,
  NewVariantInput,
  ProductInput,
  VariantInput,
} from '../../../types/sellerProduct'

export const sellerProductsApi = {
  async list(query: ManagedProductQuery): Promise<PaginatedList<ManagedProductSummary>> {
    const { data } = await apiClient.get<PaginatedList<ManagedProductSummary>>('/products/manage', { params: query })
    return data
  },

  async get(id: string): Promise<ManagedProduct> {
    const { data } = await apiClient.get<ManagedProduct>(`/products/${id}/manage`)
    return data
  },

  async create(product: ProductInput): Promise<string> {
    const { data } = await apiClient.post<string>('/products', product)
    return data
  },

  async update(id: string, product: ProductInput): Promise<void> {
    await apiClient.put(`/products/${id}`, product)
  },

  async setActive(id: string, isActive: boolean): Promise<void> {
    await apiClient.post(`/products/${id}/${isActive ? 'activate' : 'deactivate'}`)
  },

  async saveAttributes(id: string, attributes: ProductAttribute[]): Promise<void> {
    await apiClient.put(`/products/${id}/attributes`, { attributes })
  },

  async addVariant(productId: string, variant: NewVariantInput): Promise<string> {
    const { data } = await apiClient.post<string>(`/products/${productId}/variants`, variant)
    return data
  },

  async updateVariant(productId: string, variantId: string, variant: VariantInput): Promise<void> {
    await apiClient.put(`/products/${productId}/variants/${variantId}`, variant)
  },

  async setVariantActive(productId: string, variantId: string, isActive: boolean): Promise<void> {
    await apiClient.post(`/products/${productId}/variants/${variantId}/${isActive ? 'activate' : 'deactivate'}`)
  },

  // Units ready to sell (units held for open orders are kept aside by the API).
  async setStock(productId: string, variantId: string, quantity: number): Promise<void> {
    await apiClient.put(`/products/${productId}/variants/${variantId}/stock`, { quantity })
  },

  async addImage(productId: string, image: { url: string; altText?: string }): Promise<string> {
    const { data } = await apiClient.post<string>(`/products/${productId}/images`, image)
    return data
  },

  async removeImage(productId: string, imageId: string): Promise<void> {
    await apiClient.delete(`/products/${productId}/images/${imageId}`)
  },
}