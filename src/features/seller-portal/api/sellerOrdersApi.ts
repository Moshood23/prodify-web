import apiClient from '../../../services/api/apiClient'
import type { PaginatedList } from '../../../types/catalog'
import type {
  SellerOrderCounts,
  SellerOrderDetails,
  SellerOrderQuery,
  SellerOrderStatusChange,
  SellerOrderSummary,
} from '../../../types/sellerOrder'

export const sellerOrdersApi = {
  async list(query: SellerOrderQuery): Promise<PaginatedList<SellerOrderSummary>> {
    const { data } = await apiClient.get<PaginatedList<SellerOrderSummary>>('/seller-orders', { params: query })
    return data
  },

  async counts(): Promise<SellerOrderCounts> {
    const { data } = await apiClient.get<SellerOrderCounts>('/seller-orders/counts')
    return data
  },

  async get(id: string): Promise<SellerOrderDetails> {
    const { data } = await apiClient.get<SellerOrderDetails>(`/seller-orders/${id}`)
    return data
  },

  async changeStatus(id: string, change: SellerOrderStatusChange): Promise<void> {
    await apiClient.post(`/seller-orders/${id}/status`, change)
  },
}