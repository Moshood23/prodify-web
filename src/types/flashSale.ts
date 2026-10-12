// Shapes returned by the flash sale endpoints of the API.

// A flash sale running on a variant, as the product page and the cart see it.
export interface FlashSaleOffer {
  flashSaleId: string
  salePrice: number
  // The crossed-out price.
  wasPrice: number
  endsAt: string
  quantity: number
  sold: number
  maxPerCustomer: number
  // How many more this shopper can have at the sale price (0 = sold out, or they've had their share).
  allowance: number
}

// On a product card: a flash sale on the variant the card shows.
export interface ProductCardSale {
  salePrice: number
  wasPrice: number
  endsAt: string
}

// GET /api/deals
export interface Deal {
  flashSaleId: string
  productId: string
  productVariantId: string
  productName: string
  variantName: string | null
  imageUrl: string | null
  salePrice: number
  wasPrice: number
  percentOff: number
  startsAt: string
  endsAt: string
  quantity: number
  sold: number
  maxPerCustomer: number
  // False when the sale units are gone or the seller has no stock left.
  canBuy: boolean
}

export interface Deals {
  live: Deal[]
  upcoming: Deal[]
}

export type FlashSaleState = 'Pending' | 'Expired' | 'Upcoming' | 'Live' | 'SoldOut' | 'Ended' | 'Rejected' | 'Cancelled' | 'Stopped'

// GET /api/seller-flash-sales and /api/admin/flash-sales
export interface FlashSale {
  id: string
  sellerId: string
  sellerName: string
  productId: string
  productVariantId: string
  productName: string
  variantName: string | null
  imageUrl: string | null
  salePrice: number
  // The price when the sale was set up, and the price today.
  regularPrice: number
  currentPrice: number
  quantity: number
  sold: number
  maxPerCustomer: number
  startsAt: string
  endsAt: string
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Stopped'
  state: FlashSaleState
  reviewNote: string | null
  createdAt: string
}

// "pending", "live", "upcoming", "ended", or undefined for all.
export type FlashSaleFilter = 'pending' | 'live' | 'upcoming' | 'ended' | undefined

// POST /api/seller-flash-sales
export interface NewFlashSale {
  productVariantId: string
  salePrice: number
  quantity: number
  maxPerCustomer: number
  startsAt: string
  endsAt: string
}
