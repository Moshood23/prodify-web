// Products a guest looked at, kept in this browser. After logging in they move to the account.
const STORAGE_KEY = 'prodify.recentlyViewed'
export const MAX_RECENTLY_VIEWED = 20

export interface ViewedProduct {
  productId: string
  viewedAt: string
}

function read(): ViewedProduct[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((v): v is ViewedProduct => typeof v?.productId === 'string') : []
  } catch {
    return []
  }
}

function write(list: ViewedProduct[]) {
  try {
    if (list.length === 0) localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // Private mode or storage full: recently viewed just isn't remembered.
  }
}

export const recentlyViewedStorage = {
  // Newest first.
  list: read,

  remember(productId: string) {
    const rest = read().filter((v) => v.productId !== productId)
    write([{ productId, viewedAt: new Date().toISOString() }, ...rest].slice(0, MAX_RECENTLY_VIEWED))
  },

  clear() {
    write([])
  },
}
