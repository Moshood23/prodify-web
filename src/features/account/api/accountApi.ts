import apiClient from '../../../services/api/apiClient'
import type { AuthResult } from '../../../types/auth'
import type { CustomerProfile } from '../../../types/order'

export interface AddressInput {
  label: string
  recipientName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  country: string
  phoneNumber: string
}

export interface ProfileInput {
  firstName: string
  lastName: string
  phoneNumber?: string
}

export const accountApi = {
  async getMe(): Promise<CustomerProfile> {
    const { data } = await apiClient.get<CustomerProfile>('/customers/me')
    return data
  },

  async updateProfile(profile: ProfileInput): Promise<void> {
    await apiClient.put('/customers/me', profile)
  },

  async addAddress(address: AddressInput & { setAsDefault: boolean }): Promise<string> {
    const { data } = await apiClient.post<string>('/customers/me/addresses', address)
    return data
  },

  async updateAddress(id: string, address: AddressInput): Promise<void> {
    await apiClient.put(`/customers/me/addresses/${id}`, address)
  },

  async deleteAddress(id: string): Promise<void> {
    await apiClient.delete(`/customers/me/addresses/${id}`)
  },

  async setDefaultAddress(id: string): Promise<void> {
    await apiClient.post(`/customers/me/addresses/${id}/default`)
  },

  // Returns new tokens: the API logs out every other session when the password changes.
  async changePassword(currentPassword: string, newPassword: string): Promise<AuthResult> {
    const { data } = await apiClient.post<AuthResult>('/auth/change-password', { currentPassword, newPassword })
    return data
  },
}