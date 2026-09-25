import apiClient from '../../../services/api/apiClient'
import type { Cart } from '../../../types/order'

export const cartApi = {
  async getCart(): Promise<Cart> {
    const { data } = await apiClient.get<Cart>('/cart')
    return data
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