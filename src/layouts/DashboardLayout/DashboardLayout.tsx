import { Link, NavLink, Outlet } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { LogOut, ShoppingBag } from 'lucide-react'
import { Logo } from '../../components/ui/Logo'
import { useAuthStore } from '../../store/authStore'
import { useLogout } from '../../features/auth/hooks/useLogout'

export interface DashboardNavItem {
  label: string
  to: string
  icon: LucideIcon
  // Only highlight on an exact match (for the dashboard home link).
  end?: boolean
}

interface DashboardLayoutProps {
  title: string // "seller" or "admin", shown next to the logo
  navItems: DashboardNavItem[]
}

// Shared shell for the seller portal and the admin portal: dark sidebar + content area.
// On small screens the sidebar becomes a scrollable row of links under the header.
export function DashboardLayout({ title, navItems }: DashboardLayoutProps) {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="hidden w-60 shrink-0 flex-col bg-ink p-4 text-slate-300 md:flex">
        <div className="mb-8 px-2">
          <Logo suffix={title} />
        </div>

        <nav className="flex flex-1 flex-col gap-1 text-sm">
          {navItems.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 ${isActive ? 'bg-primary text-white' : 'hover:bg-slate-800 hover:text-white'}`
              }
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>

        <button onClick={logout} className="mt-4 flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-slate-800 hover:text-white">
          <LogOut className="h-4 w-4" aria-hidden /> Logout
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-border bg-white">
          <div className="flex items-center gap-4 px-4 py-3 sm:px-6">
            <div className="md:hidden">
              <Logo variant="dark" suffix={title} />
            </div>
            <div className="ml-auto flex items-center gap-4 text-sm">
              <Link to="/" className="flex items-center gap-1.5 font-medium text-primary hover:underline">
                <ShoppingBag className="h-4 w-4" aria-hidden /> Go to shop
              </Link>
              <span className="hidden text-muted sm:inline">{user?.email}</span>
              <button onClick={logout} className="flex items-center gap-1.5 text-muted hover:text-ink md:hidden" aria-label="Logout">
                <LogOut className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>

          <nav aria-label={`${title} menu`} className="flex gap-1 overflow-x-auto px-3 pb-2 text-sm md:hidden">
            {navItems.map(({ label, to, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 ${isActive ? 'bg-primary text-white' : 'bg-surface text-ink'}`
                }
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}