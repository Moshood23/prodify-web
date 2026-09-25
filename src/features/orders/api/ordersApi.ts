import apiClient from '../../../services/api/apiClient'
import type { PaginatedList } from '../../../types/catalog'
import type { OrderDetails, OrderSummary } from '../../../types/order'

export const ordersApi = {
  async getMyOrders(pageNumber: number, pageSize = 10): Promise<PaginatedList<OrderSummary>> {
    const { data } = await apiClient.get<PaginatedList<OrderSummary>>('/orders', { params: { pageNumber, pageSize } })
    return data
  },

  async getOrder(id: string): Promise<OrderDetails> {
    const { data } = await apiClient.get<OrderDetails>(`/orders/${id}`)
    return data
  },

  async cancelOrder(id: string, reason?: string): Promise<void> {
    await apiClient.post(`/orders/${id}/cancel`, { reason })
  },

  // The payment gateway is simulated for now: any token succeeds except ones containing "FAIL".
  async pay(orderId: string, paymentMethodToken: string): Promise<void> {
    await apiClient.post('/payments', { orderId, paymentMethodToken })
  },
}