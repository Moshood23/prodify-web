import apiClient from '../../../services/api/apiClient'
import type { SellerApplication, SellerApplicationResult, SellerProfile } from '../../../types/seller'

export const sellerApi = {
  async apply(application: SellerApplication): Promise<SellerApplicationResult> {
    const { data } = await apiClient.post<SellerApplicationResult>('/sellers', application)
    return data
  },

  async getMe(): Promise<SellerProfile> {
    const { data } = await apiClient.get<SellerProfile>('/sellers/me')
    return data
  },

  async reapply(details: { businessName: string; phoneNumber: string; description?: string }): Promise<void> {
    await apiClient.post('/sellers/me/reapply', details)
  },
}