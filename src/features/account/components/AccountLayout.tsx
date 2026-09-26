import { NavLink, Outlet } from 'react-router-dom'
import { KeyRound, LayoutDashboard, MapPin, Package, UserRound } from 'lucide-react'
import { useAuthStore } from '../../../store/authStore'

const links = [
  { to: '/account', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/orders', label: 'Orders', icon: Package, end: false },
  { to: '/account/addresses', label: 'Addresses', icon: MapPin, end: false },
  { to: '/account/profile', label: 'Profile', icon: UserRound, end: false },
  { to: '/account/password', label: 'Password', icon: KeyRound, end: false },
]

// Customer "My account": sidebar on large screens, a row of tabs on small ones.
export function AccountLayout() {
  const email = useAuthStore((s) => s.user?.email)

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[14rem_1fr]">
      {/* min-w-0 lets the tab row scroll on phones instead of widening the page. */}
      <aside className="min-w-0 lg:sticky lg:top-4">
        <p className="mb-3 hidden truncate px-3 text-sm text-muted lg:block" title={email}>
          {email}
        </p>
        <nav aria-label="My account" className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  isActive ? 'bg-primary font-semibold text-white' : 'bg-white text-ink hover:bg-primary-light hover:text-primary lg:bg-transparent'
                }`
              }
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  )
}