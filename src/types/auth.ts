export type Role = 'Customer' | 'Seller' | 'Admin'

// Response of POST /api/auth/login, /register and /refresh.
export interface AuthResult {
  token: string
  refreshToken: string
  userId: string
}

// What we read out of the JWT access token.
export interface AuthUser {
  id: string
  email: string
  roles: Role[]
  customerId?: string
  sellerId?: string
  expiresAt: number // unix seconds
}