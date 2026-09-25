import apiClient from '../../../services/api/apiClient'
import type { PaginatedList } from '../../../types/catalog'
import type { AdminDashboard, SellerDetails, SellerSummary } from '../../../types/admin'
import type { SellerStatus } from '../../../types/seller'

export interface SellerListQuery {
  status?: SellerStatus
  search?: string
  pageNumber?: number
  pageSize?: number
}

export type SellerAction = 'approve' | 'reject' | 'suspend' | 'reinstate'

export const adminApi = {
  async getDashboard(): Promise<AdminDashboard> {
    const { data } = await apiClient.get<AdminDashboard>('/admin/dashboard')
    return data
  },

  async getSellers(query: SellerListQuery): Promise<PaginatedList<SellerSummary>> {
    const { data } = await apiClient.get<PaginatedList<SellerSummary>>('/admin/sellers', { params: query })
    return data
  },

  async getSeller(id: string): Promise<SellerDetails> {
    const { data } = await apiClient.get<SellerDetails>(`/admin/sellers/${id}`)
    return data
  },

  // Reject and suspend need a reason; it is shown to the seller.
  async changeSellerStatus(id: string, action: SellerAction, reason?: string): Promise<void> {
    await apiClient.post(`/admin/sellers/${id}/${action}`, reason === undefined ? undefined : { reason })
  },
}