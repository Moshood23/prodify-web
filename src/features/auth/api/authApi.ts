import apiClient from '../../../services/api/apiClient'
import { tokenStorage } from '../../../lib/tokenStorage'
import type { AuthResult } from '../../../types/auth'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  phoneNumber?: string
}

export const authApi = {
  async login(request: LoginRequest): Promise<AuthResult> {
    const { data } = await apiClient.post<AuthResult>('/auth/login', request)
    return data
  },

  async register(request: RegisterRequest): Promise<AuthResult> {
    const { data } = await apiClient.post<AuthResult>('/auth/register', request)
    return data
  },

    // Always succeeds, whether or not the email has an account.
  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email })
  },

  async resetPassword(request: { email: string; token: string; newPassword: string }): Promise<void> {
    await apiClient.post('/auth/reset-password', request)
  },


  async logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken()
    if (refreshToken) {
      await apiClient.post('/auth/logout', { refreshToken })
    }
  },
}