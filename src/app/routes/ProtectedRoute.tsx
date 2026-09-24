import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import type { Role } from '../../types/auth'

interface ProtectedRouteProps {
  children: ReactNode
  // If given, the user needs at least one of these roles.
  roles?: Role[]
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)

  if (!user) {
    const returnTo = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />
  }

  if (roles && !roles.some((role) => user.roles.includes(role))) {
    return <Navigate to="/forbidden" replace />
  }

  return <>{children}</>
}