import { Link } from 'react-router-dom'
import { LogOut, ShoppingCart, Store, User } from 'lucide-react'
import { Logo } from '../../components/ui/Logo'
import { useAuthStore } from '../../store/authStore'
import { useLogout } from '../../features/auth/hooks/useLogout'
import { useCartCount } from '../../features/cart/hooks/useCart'
import { SearchBar } from './SearchBar'

export function Header() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const cartCount = useCartCount()

  return (
    <header className="bg-primary text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
        <Logo />

        <SearchBar />

        <nav className="ml-auto flex items-center gap-4 text-sm">
          {user?.roles.includes('Seller') && (
            <Link to="/seller" className="flex items-center gap-1.5 hover:text-accent-light">
              <Store className="h-4 w-4" aria-hidden /> Seller Centre
            </Link>
          )}

          {user ? (
            <>
              <span className="hidden items-center gap-1.5 sm:flex">
                <User className="h-4 w-4" aria-hidden /> {user.email}
              </span>
              <button onClick={logout} className="flex items-center gap-1.5 hover:text-accent-light">
                <LogOut className="h-4 w-4" aria-hidden /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="flex items-center gap-1.5 hover:text-accent-light">
              <User className="h-4 w-4" aria-hidden /> Login
            </Link>
          )}

          <Link
            to="/cart"
            className="relative flex items-center gap-1.5 hover:text-accent-light"
            aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : 'Cart'}
          >
            <ShoppingCart className="h-4 w-4" aria-hidden /> Cart
            {cartCount > 0 && (
              <span className="absolute -right-3 -top-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-ink">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  )
}