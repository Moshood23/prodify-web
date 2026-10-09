import apiClient from '../../../services/api/apiClient'
import type { PaginatedList } from '../../../types/catalog'
import type { OrderDetails, OrderSummary, PaymentOptions, PaystackOutcome, PaystackStart } from '../../../types/order'

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

  async paymentOptions(): Promise<PaymentOptions> {
    const { data } = await apiClient.get<PaymentOptions>('/payments/options')
    return data
  },

  // Simulated gateway (no Paystack key on the API): any token succeeds except ones containing "FAIL".
  async pay(orderId: string, paymentMethodToken: string): Promise<void> {
    await apiClient.post('/payments', { orderId, paymentMethodToken })
  },

  async startPaystack(orderId: string): Promise<PaystackStart> {
    const { data } = await apiClient.post<PaystackStart>('/payments/paystack/start', { orderId })
    return data
  },

  async verifyPaystack(reference: string): Promise<PaystackOutcome> {
    const { data } = await apiClient.post<PaystackOutcome>(`/payments/paystack/verify/${encodeURIComponent(reference)}`)
    return data
  },
}
