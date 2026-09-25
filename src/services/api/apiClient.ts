import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { tokenStorage } from '../../lib/tokenStorage'
import { decodeUser } from '../../lib/jwt'
import { useAuthStore } from '../../store/authStore'
import type { AuthResult } from '../../types/auth'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5255/api'

// Refresh a little before the real expiry, so a token never expires on the way to the API.
const EXPIRY_MARGIN_SECONDS = 30

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// If several requests need a new token at the same time, they all wait for the same refresh call.
let refreshInFlight: Promise<string | null> | null = null

async function requestNewTokens(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken()

  if (!refreshToken) return null

  try {
    // Plain axios (not apiClient) so this call never goes through the interceptors itself.
    const { data } = await axios.post<AuthResult>(`${API_BASE_URL}/auth/refresh`, { refreshToken })
    useAuthStore.getState().setSession(data)
    return data.token
  } catch {
    return null
  }
}

function refreshAccessToken(): Promise<string | null> {
  refreshInFlight ??= requestNewTokens().finally(() => {
    refreshInFlight = null
  })
  return refreshInFlight
}

function isExpired(token: string): boolean {
  const expiresAt = decodeUser(token)?.expiresAt
  return expiresAt === undefined || expiresAt - EXPIRY_MARGIN_SECONDS <= Date.now() / 1000
}

function isAuthCall(url: string | undefined): boolean {
  return url?.startsWith('/auth/') ?? false
}

// 1. Attach the access token to every request, refreshing it first if it has expired.
//    (Public pages never answer 401, so without this an expired token would be sent forever.)
apiClient.interceptors.request.use(async (config) => {
  let token = tokenStorage.getAccessToken()

  if (token && !isAuthCall(config.url) && isExpired(token)) {
    token = await refreshAccessToken()

    // The session is over (refresh token expired or revoked): carry on as a guest.
    if (!token) useAuthStore.getState().clearSession()
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// 2. If a request still fails with 401 (e.g. the token was revoked), get a new token pair
//    with the refresh token and retry the request once.
type RetriableRequest = InternalAxiosRequestConfig & { _retried?: boolean }

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetriableRequest | undefined

    if (error.response?.status !== 401 || !request || request._retried || isAuthCall(request.url)) {
      return Promise.reject(error)
    }

    request._retried = true

    const newToken = await refreshAccessToken()

    if (!newToken) {
      // The refresh token is missing, expired or revoked: the user must log in again.
      useAuthStore.getState().clearSession()

      // Protected pages may already have sent the user to the login page.
      if (window.location.pathname !== '/login') {
        const returnTo = encodeURIComponent(window.location.pathname + window.location.search)
        window.location.assign(`/login?returnTo=${returnTo}`)
      }
      return Promise.reject(error)
    }

    request.headers.Authorization = `Bearer ${newToken}`
    return apiClient(request)
  },
)

export default apiClient