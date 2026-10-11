import apiClient from '../../services/api/apiClient'
import type { NewReturn, ReturnRequest } from '../../types/returns'

// "open" = waiting on someone (Requested or Escalated); a status name; or undefined for all.
export type ReturnFilter = 'open' | 'Escalated' | undefined

export const returnsApi = {
  async request(request: NewReturn): Promise<string> {
    const { data } = await apiClient.post<string>('/returns', request)
    return data
  },

  async escalate(id: string, note?: string): Promise<void> {
    await apiClient.post(`/returns/${id}/escalate`, { note })
  },
}

export const sellerReturnsApi = {
  async list(status: ReturnFilter): Promise<ReturnRequest[]> {
    const { data } = await apiClient.get<ReturnRequest[]>('/seller-returns', { params: { status } })
    return data
  },

  async accept(id: string): Promise<void> {
    await apiClient.post(`/seller-returns/${id}/accept`)
  },

  async reject(id: string, note: string): Promise<void> {
    await apiClient.post(`/seller-returns/${id}/reject`, { note })
  },
}

export const adminReturnsApi = {
  async list(status: ReturnFilter): Promise<ReturnRequest[]> {
    const { data } = await apiClient.get<ReturnRequest[]>('/admin/returns', { params: { status } })
    return data
  },

  async approve(id: string, note?: string): Promise<void> {
    await apiClient.post(`/admin/returns/${id}/approve`, { note })
  },

  async decline(id: string, note: string): Promise<void> {
    await apiClient.post(`/admin/returns/${id}/decline`, { note })
  },
}
