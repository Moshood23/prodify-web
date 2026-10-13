import apiClient from '../../services/api/apiClient'
import type { PaginatedList, ProductSummary } from '../../types/catalog'
import type { ViewedProduct } from './recentlyViewedStorage'

export const recommendationsApi = {
  // "You may also like" for a product page.
  async getSimilar(productId: string, take = 8): Promise<ProductSummary[]> {
    const { data } = await apiClient.get<ProductSummary[]>(`/products/${productId}/similar`, { params: { take } })
    return data
  },

  // The logged-in customer's recently viewed products, newest first.
  async getRecentlyViewed(exclude?: string, take = 12): Promise<ProductSummary[]> {
    const { data } = await apiClient.get<ProductSummary[]>('/products/recently-viewed', { params: { exclude, take } })
    return data
  },

  // One product page view, or the list a guest built up before logging in.
  async recordViews(products: ViewedProduct[] | { productId: string }[]): Promise<void> {
    await apiClient.post('/products/recently-viewed', { products })
  },

  // Product cards for a guest's list, in the same order. Hidden products drop out.
  async getCards(ids: string[]): Promise<ProductSummary[]> {
    if (ids.length === 0) return []
    const { data } = await apiClient.get<PaginatedList<ProductSummary>>('/products', {
      params: { ids, pageSize: ids.length },
      // ids=a&ids=b, the way ASP.NET reads a list from the query string.
      paramsSerializer: { indexes: null },
    })
    const position = new Map(ids.map((id, index) => [id, index]))
    return [...data.items].sort((a, b) => (position.get(a.id) ?? 0) - (position.get(b.id) ?? 0))
  },
}
