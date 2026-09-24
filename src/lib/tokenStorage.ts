const ACCESS_TOKEN_KEY = 'prodify.accessToken'
const REFRESH_TOKEN_KEY = 'prodify.refreshToken'

// Browsers can block storage (private mode, strict settings); never let that crash the app.
function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // ignore
  }
}

export const tokenStorage = {
  getAccessToken: () => read(ACCESS_TOKEN_KEY),
  getRefreshToken: () => read(REFRESH_TOKEN_KEY),

  setTokens(accessToken: string, refreshToken: string) {
    write(ACCESS_TOKEN_KEY, accessToken)
    write(REFRESH_TOKEN_KEY, refreshToken)
  },

  clear() {
    write(ACCESS_TOKEN_KEY, null)
    write(REFRESH_TOKEN_KEY, null)
  },
}