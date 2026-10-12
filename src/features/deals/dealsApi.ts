import apiClient from '../../services/api/apiClient'
import type { Deals, FlashSale, FlashSaleFilter, NewFlashSale } from '../../types/flashSale'

export const dealsApi = {
  async get(): Promise<Deals> {
    const { data } = await apiClient.get<Deals>('/deals')
    return data
  },
}

export const sellerFlashSalesApi = {
  async list(state: FlashSaleFilter): Promise<FlashSale[]> {
    const { data } = await apiClient.get<FlashSale[]>('/seller-flash-sales', { params: { state } })
    return data
  },

  async create(sale: NewFlashSale): Promise<string> {
    const { data } = await apiClient.post<string>('/seller-flash-sales', sale)
    return data
  },

  async cancel(id: string): Promise<void> {
    await apiClient.post(`/seller-flash-sales/${id}/cancel`)
  },
}

export const adminFlashSalesApi = {
  async list(state: FlashSaleFilter): Promise<FlashSale[]> {
    const { data } = await apiClient.get<FlashSale[]>('/admin/flash-sales', { params: { state } })
    return data
  },

  async approve(id: string): Promise<void> {
    await apiClient.post(`/admin/flash-sales/${id}/approve`)
  },

  async reject(id: string, note: string): Promise<void> {
    await apiClient.post(`/admin/flash-sales/${id}/reject`, { note })
  },

  async stop(id: string, note: string): Promise<void> {
    await apiClient.post(`/admin/flash-sales/${id}/stop`, { note })
  },
}
