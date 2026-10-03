import { create } from 'zustand'

// A guest's cart lives in this browser until they log in or sign up,
// then it is moved into their account cart.
export interface GuestCartItem {
  productVariantId: string
  quantity: number
}

const STORAGE_KEY = 'prodify-guest-cart'

// Same limits as the API (CartRules).
export const MAX_QUANTITY_PER_ITEM = 10
const MAX_LINES = 50

function read(): GuestCartItem[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(saved)) return []
    return saved
      .filter((i): i is GuestCartItem => typeof i?.productVariantId === 'string' && Number.isInteger(i?.quantity) && i.quantity > 0)
      .map((i) => ({ productVariantId: i.productVariantId, quantity: Math.min(i.quantity, MAX_QUANTITY_PER_ITEM) }))
      .slice(0, MAX_LINES)
  } catch {
    return []
  }
}

function save(items: GuestCartItem[]) {
  try {
    if (items.length === 0) localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Private browsing: the cart is kept until the tab closes.
  }
}

interface GuestCartState {
  items: GuestCartItem[]
  // Returns how many were actually added (0 when the item is already at the limit).
  add: (productVariantId: string, quantity: number) => number
  setQuantity: (productVariantId: string, quantity: number) => void
  remove: (productVariantId: string) => void
  clear: () => void
}

export const useGuestCartStore = create<GuestCartState>((set, get) => {
  function update(items: GuestCartItem[]) {
    save(items)
    set({ items })
  }

  return {
    items: read(),

    add(productVariantId, quantity) {
      const items = get().items
      const existing = items.find((i) => i.productVariantId === productVariantId)
      if (!existing && items.length >= MAX_LINES) return 0

      const current = existing?.quantity ?? 0
      const added = Math.max(0, Math.min(quantity, MAX_QUANTITY_PER_ITEM - current))
      if (added === 0) return 0

      update(
        existing
          ? items.map((i) => (i.productVariantId === productVariantId ? { ...i, quantity: current + added } : i))
          : [...items, { productVariantId, quantity: added }],
      )
      return added
    },

    setQuantity(productVariantId, quantity) {
      const clamped = Math.max(1, Math.min(quantity, MAX_QUANTITY_PER_ITEM))
      update(get().items.map((i) => (i.productVariantId === productVariantId ? { ...i, quantity: clamped } : i)))
    },

    remove(productVariantId) {
      update(get().items.filter((i) => i.productVariantId !== productVariantId))
    },

    clear() {
      update([])
    },
  }
})