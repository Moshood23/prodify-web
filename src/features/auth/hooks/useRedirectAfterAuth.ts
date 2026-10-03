import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { useMergeGuestCart } from '../../cart/hooks/useCart'

// After login/register: move any guest cart into the account, then go back to the
// page the user came from (?returnTo=...), otherwise to the right home page for their role.
export function useRedirectAfterAuth() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mergeGuestCart = useMergeGuestCart()

  return async function redirect() {
    await mergeGuestCart()

    const user = useAuthStore.getState().user
    const returnTo = searchParams.get('returnTo')
    const home = user?.roles.includes('Admin') ? '/admin' : '/'

    // Only follow relative paths, never a full URL from the query string.
    const safeReturnTo = returnTo?.startsWith('/') && !returnTo.startsWith('//') ? returnTo : null

    navigate(safeReturnTo ?? home, { replace: true })
  }
}
