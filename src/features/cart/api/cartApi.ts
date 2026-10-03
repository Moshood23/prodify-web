import apiClient from '../../../services/api/apiClient'
import type { Cart } from '../../../types/order'
import type { GuestCartItem } from '../../../store/guestCartStore'

export const cartApi = {
  async getCart(): Promise<Cart> {
    const { data } = await apiClient.get<Cart>('/cart')
    return data
  },

    // Prices a guest's cart. Each item's id is its variant id.
  async preview(items: GuestCartItem[]): Promise<Cart> {
    const { data } = await apiClient.post<Cart>('/cart/preview', { items })
    return data
  },

  // After logging in: moves the guest cart into the account cart.
  // Returns notes about anything that couldn't be moved in full.
  async merge(items: GuestCartItem[]): Promise<string[]> {
    const { data } = await apiClient.post<{ notes: string[] }>('/cart/merge', { items })
    return data.notes
  },


  async addItem(productVariantId: string, quantity: number): Promise<void> {
    await apiClient.post('/cart/items', { productVariantId, quantity })
  },

  async updateQuantity(cartItemId: string, quantity: number): Promise<void> {
    await apiClient.put(`/cart/items/${cartItemId}`, { quantity })
  },

  async removeItem(cartItemId: string): Promise<void> {
    await apiClient.delete(`/cart/items/${cartItemId}`)
  },
}