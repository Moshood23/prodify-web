import apiClient from '../../services/api/apiClient'
import type { PaginatedList } from '../../types/catalog'
import type { AdminPayout, AdminPayoutQuery, Earnings, PayoutAccount, PlatformSettings } from '../../types/payout'

// The seller's side.
export const earningsApi = {
  async get(): Promise<Earnings> {
    const { data } = await apiClient.get<Earnings>('/seller/earnings')
    return data
  },

  async saveAccount(account: PayoutAccount): Promise<void> {
    await apiClient.put('/seller/earnings/account', account)
  },

  async requestPayout(amount: number): Promise<void> {
    await apiClient.post('/seller/earnings/payouts', { amount })
  },
}

// The admin's side.
export const adminPayoutsApi = {
  async list(query: AdminPayoutQuery): Promise<PaginatedList<AdminPayout>> {
    const { data } = await apiClient.get<PaginatedList<AdminPayout>>('/admin/payouts', { params: query })
    return data
  },

  async markPaid(id: string, reference: string): Promise<void> {
    await apiClient.post(`/admin/payouts/${id}/pay`, { reference })
  },

  async reject(id: string, reason: string): Promise<void> {
    await apiClient.post(`/admin/payouts/${id}/reject`, { reason })
  },

  async getSettings(): Promise<PlatformSettings> {
    const { data } = await apiClient.get<PlatformSettings>('/admin/settings')
    return data
  },

  async updateSettings(settings: PlatformSettings): Promise<void> {
    await apiClient.put('/admin/settings', settings)
  },
}
