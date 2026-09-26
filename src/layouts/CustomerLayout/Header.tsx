import { Link } from 'react-router-dom'
import { LayoutDashboard, LogOut, ShoppingCart, Store, User, UserRound } from 'lucide-react'
import { Logo } from '../../components/ui/Logo'
import { useAuthStore } from '../../store/authStore'
import { useLogout } from '../../features/auth/hooks/useLogout'
import { useCartCount } from '../../features/cart/hooks/useCart'
import { SearchBar } from './SearchBar'

export function Header() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const cartCount = useCartCount()

  const isAdmin = user?.roles.includes('Admin') ?? false
  const isSeller = user?.roles.includes('Seller') ?? false
  // Guests see the cart too (it asks them to log in); admin-only accounts can't shop.
  const canShop = !user || user.roles.includes('Customer')

  return (
    <header className="bg-primary text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
        <Logo />

        <SearchBar />

        <nav className="ml-auto flex items-center gap-4 text-sm">
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-1.5 hover:text-accent-light">
              <LayoutDashboard className="h-4 w-4" aria-hidden /> Admin
            </Link>
          )}

          {isSeller && (
            <Link to="/seller" className="flex items-center gap-1.5 hover:text-accent-light">
              <Store className="h-4 w-4" aria-hidden /> Seller Centre
            </Link>
          )}

          {!isSeller && !isAdmin && (
            <Link to="/sell" className="hidden items-center gap-1.5 hover:text-accent-light lg:flex">
              <Store className="h-4 w-4" aria-hidden /> Sell on Prodify
            </Link>
          )}

          {user?.roles.includes('Customer') ? (
            <Link to="/account" className="flex items-center gap-1.5 hover:text-accent-light" title={user.email}>
              <UserRound className="h-4 w-4" aria-hidden /> My account
            </Link>
          ) : (
            user && (
              <span className="hidden items-center gap-1.5 sm:flex">
                <User className="h-4 w-4" aria-hidden /> {user.email}
              </span>
            )
          )}

          {user ? (
            <button onClick={logout} className="flex items-center gap-1.5 hover:text-accent-light">
              <LogOut className="h-4 w-4" aria-hidden /> Logout
            </button>
          ) : (
            <Link to="/login" className="flex items-center gap-1.5 hover:text-accent-light">
              <User className="h-4 w-4" aria-hidden /> Login
            </Link>
          )}

          {canShop && (
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
          )}
        </nav>
      </div>
    </header>
  )
}