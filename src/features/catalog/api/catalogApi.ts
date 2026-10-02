import apiClient from '../../../services/api/apiClient'
import type {
  Brand,
  Category,
  PaginatedList,
  ProductDetails,
  ProductQuery,
  ProductReviews,
  ProductSummary,
  ReviewInput,
} from '../../../types/catalog'

export const catalogApi = {
  async getProducts(query: ProductQuery): Promise<PaginatedList<ProductSummary>> {
    const { data } = await apiClient.get<PaginatedList<ProductSummary>>('/products', { params: query })
    return data
  },

  async getProduct(id: string): Promise<ProductDetails> {
    const { data } = await apiClient.get<ProductDetails>(`/products/${id}`)
    return data
  },

    async getReviews(productId: string, pageSize: number): Promise<ProductReviews> {
    const { data } = await apiClient.get<ProductReviews>(`/products/${productId}/reviews`, { params: { pageSize } })
    return data
  },

  // Writes the customer's review, or updates it if they already wrote one.
  async submitReview(productId: string, review: ReviewInput): Promise<void> {
    await apiClient.post(`/products/${productId}/reviews`, review)
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