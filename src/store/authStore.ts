import { create } from 'zustand'
import { decodeUser } from '../lib/jwt'
import { tokenStorage } from '../lib/tokenStorage'
import type { AuthResult, AuthUser, Role } from '../types/auth'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  setSession: (result: AuthResult) => void
  clearSession: () => void
  hasRole: (role: Role) => boolean
}

function userFromStorage(): AuthUser | null {
  const token = tokenStorage.getAccessToken()
  return token ? decodeUser(token) : null
}

const initialUser = userFromStorage()

export const useAuthStore = create<AuthState>((set, get) => ({
  // An expired access token is fine here: the API client refreshes it on the first 401.
  user: initialUser,
  isAuthenticated: initialUser !== null,

  setSession(result) {
    tokenStorage.setTokens(result.token, result.refreshToken)
    const user = decodeUser(result.token)
    set({ user, isAuthenticated: user !== null })
  },

  clearSession() {
    tokenStorage.clear()
    set({ user: null, isAuthenticated: false })
  },

  hasRole(role) {
    return get().user?.roles.includes(role) ?? false
  },
}))