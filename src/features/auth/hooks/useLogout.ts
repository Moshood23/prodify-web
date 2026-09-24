import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../../../store/authStore'

export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const clearSession = useAuthStore((s) => s.clearSession)

  return async function logout() {
    try {
      await authApi.logout()
    } catch {
      // Even if the server call fails (e.g. offline), log out locally.
    } finally {
      clearSession()
      queryClient.clear() // forget cached data that belonged to this user
      navigate('/')
    }
  }
}