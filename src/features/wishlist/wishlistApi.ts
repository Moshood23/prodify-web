import apiClient from '../../services/api/apiClient'
import type { PaginatedList, ProductSummary } from '../../types/catalog'

export const wishlistApi = {
  // Saved products, most recently saved first.
  async getPage(pageNumber: number, pageSize: number): Promise<PaginatedList<ProductSummary>> {
    const { data } = await apiClient.get<PaginatedList<ProductSummary>>('/wishlist', { params: { pageNumber, pageSize } })
    return data
  },

  async getIds(): Promise<string[]> {
    const { data } = await apiClient.get<string[]>('/wishlist/ids')
    return data
  },

  async save(productId: string): Promise<void> {
    await apiClient.put(`/wishlist/${productId}`)
  },

  async remove(productId: string): Promise<void> {
    await apiClient.delete(`/wishlist/${productId}`)
  },
}
