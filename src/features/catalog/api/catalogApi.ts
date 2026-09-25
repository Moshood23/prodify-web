import apiClient from '../../../services/api/apiClient'
import type { Brand, Category, PaginatedList, ProductDetails, ProductQuery, ProductSummary } from '../../../types/catalog'

export const catalogApi = {
  async getProducts(query: ProductQuery): Promise<PaginatedList<ProductSummary>> {
    const { data } = await apiClient.get<PaginatedList<ProductSummary>>('/products', { params: query })
    return data
  },

  async getProduct(id: string): Promise<ProductDetails> {
    const { data } = await apiClient.get<ProductDetails>(`/products/${id}`)
    return data
  },

  async getCategories(): Promise<Category[]> {
    const { data } = await apiClient.get<Category[]>('/categories')
    return data
  },

  async getBrands(): Promise<Brand[]> {
    const { data } = await apiClient.get<Brand[]>('/brands')
    return data
  },
}