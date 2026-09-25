import apiClient from '../../../services/api/apiClient'
import type { CustomerProfile, PaymentMethod } from '../../../types/order'

export interface NewAddress {
  label: string
  recipientName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode?: string
  country: string
  phoneNumber: string
  setAsDefault: boolean
}

export interface PlaceOrderRequest {
  recipientName: string
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  postalCode?: string | null
  country: string
  phoneNumber: string
  paymentMethod: PaymentMethod
}

export const checkoutApi = {
  async getMe(): Promise<CustomerProfile> {
    const { data } = await apiClient.get<CustomerProfile>('/customers/me')
    return data
  },

  async addAddress(address: NewAddress): Promise<string> {
    const { data } = await apiClient.post<string>('/customers/me/addresses', address)
    return data
  },

  // Returns the new order's id.
  async placeOrder(request: PlaceOrderRequest): Promise<string> {
    const { data } = await apiClient.post<string>('/checkout', request)
    return data
  },
}