import { Link } from 'react-router-dom'
import { LogOut, Search, ShoppingCart, Store, User } from 'lucide-react'
import { Logo } from '../../components/ui/Logo'
import { useAuthStore } from '../../store/authStore'
import { useLogout } from '../../features/auth/hooks/useLogout'

export function Header() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  return (
    <header className="bg-primary text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
        <Logo />

        <form className="order-last flex w-full items-center rounded-lg bg-white p-1 md:order-none md:flex-1" role="search">
          <Search className="ml-2 h-4 w-4 text-muted" aria-hidden />
          <input
            type="search"
            placeholder="Search products, brands and categories"
            className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-sm text-ink outline-none"
          />
          <button type="submit" className="rounded-md bg-accent px-4 py-1.5 text-sm font-semibold text-ink hover:bg-accent-dark">
            Search
          </button>
        </form>

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

          <Link to="/cart" className="flex items-center gap-1.5 hover:text-accent-light">
            <ShoppingCart className="h-4 w-4" aria-hidden /> Cart
          </Link>
        </nav>
      </div>
    </header>
  )
}