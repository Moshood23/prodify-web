import type { AuthUser, Role } from '../types/auth'

interface JwtPayload {
  sub: string
  email: string
  role?: Role | Role[]
  customerId?: string
  sellerId?: string
  email_verified?: 'true' | 'false'
  exp: number
}

// Reads the payload of a JWT. This does NOT verify the signature; the API does that.
// We only use it to show who is logged in and which menus to display.
export function decodeUser(token: string): AuthUser | null {
  try {
    const payload = token.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const data = JSON.parse(json) as JwtPayload

    const roles = data.role === undefined ? [] : Array.isArray(data.role) ? data.role : [data.role]

    return {
      id: data.sub,
      email: data.email,
      roles,
      customerId: data.customerId,
      sellerId: data.sellerId,
      // Tokens issued before email verification existed don't have the claim: those accounts count as verified.
      emailVerified: data.email_verified !== 'false',
      expiresAt: data.exp,
    }
  } catch {
    return null
  }
}
