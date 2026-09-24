import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { tokenStorage } from '../../lib/tokenStorage'
import { useAuthStore } from '../../store/authStore'
import type { AuthResult } from '../../types/auth'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5255/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 1. Attach the access token to every request.
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// 2. When a request fails with 401 (access token expired), get a new token pair
//    with the refresh token and retry the request once.
type RetriableRequest = InternalAxiosRequestConfig & { _retried?: boolean }

// If several requests fail at the same time, they all wait for the same refresh call.
let refreshInFlight: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken()

  if (!refreshToken) return null

  try {
    // Plain axios (not apiClient) so this call never triggers the interceptor itself.
    const { data } = await axios.post<AuthResult>(`${API_BASE_URL}/auth/refresh`, { refreshToken })
    useAuthStore.getState().setSession(data)
    return data.token
  } catch {
    return null
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetriableRequest | undefined
    const isAuthCall = request?.url?.startsWith('/auth/') ?? false

    if (error.response?.status !== 401 || !request || request._retried || isAuthCall) {
      return Promise.reject(error)
    }

    request._retried = true

    refreshInFlight ??= refreshAccessToken().finally(() => {
      refreshInFlight = null
    })

    const newToken = await refreshInFlight

    if (!newToken) {
      // The refresh token is missing, expired or revoked: the user must log in again.
      useAuthStore.getState().clearSession()
      const returnTo = encodeURIComponent(window.location.pathname + window.location.search)
      window.location.assign(`/login?returnTo=${returnTo}`)
      return Promise.reject(error)
    }

    request.headers.Authorization = `Bearer ${newToken}`
    return apiClient(request)
  },
)

export default apiClient