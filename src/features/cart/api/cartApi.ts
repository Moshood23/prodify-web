import apiClient from '../../../services/api/apiClient'

export interface CartItem {
  id: string
  productVariantId: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Cart {
  id: string | null
  total: number
  items: CartItem[]
}

export const cartApi = {
  async getCart(): Promise<Cart> {
    const { data } = await apiClient.get<Cart>('/cart')
    return data
  },

  async addItem(productVariantId: string, quantity: number): Promise<void> {
    await apiClient.post('/cart/items', { productVariantId, quantity })
  },
}