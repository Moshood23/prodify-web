export type SellerStatus = 'PendingVerification' | 'Approved' | 'Suspended' | 'Rejected'

export interface SellerAddress {
  id: string
  addressLine1: string
  addressLine2: string | null
  city: string
  state: string
  postalCode: string | null
  country: string
  phoneNumber: string
}

// GET /api/sellers/me (and part of the admin view).
export interface SellerProfile {
  id: string
  businessName: string
  email: string
  phoneNumber: string | null
  description: string | null
  status: SellerStatus
  // Why the application was rejected or the store suspended.
  statusReason: string | null
  statusChangedAt: string | null
  createdAt: string
  pickupAddress: SellerAddress | null
}

export interface SellerApplication {
  businessName: string
  email: string
  phoneNumber: string
  description?: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
}

export interface SellerApplicationResult {
  sellerId: string
  status: SellerStatus
  token: string
  refreshToken: string
}