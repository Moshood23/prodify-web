import { NavLink, Outlet } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { LogOut } from 'lucide-react'
import { Logo } from '../../components/ui/Logo'
import { useAuthStore } from '../../store/authStore'
import { useLogout } from '../../features/auth/hooks/useLogout'

export interface DashboardNavItem {
  label: string
  to: string
  icon: LucideIcon
}

interface DashboardLayoutProps {
  title: string // "seller" or "admin", shown next to the logo
  navItems: DashboardNavItem[]
}

// Shared shell for the seller portal and the admin portal: dark sidebar + content area.
export function DashboardLayout({ title, navItems }: DashboardLayoutProps) {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col bg-ink p-4 text-slate-300 md:flex">
        <div className="mb-8 px-2">
          <Logo suffix={title} />
        </div>

        <nav className="flex flex-1 flex-col gap-1 text-sm">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 ${
                  isActive ? 'bg-primary text-white' : 'hover:bg-slate-800 hover:text-white'
                }`
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

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-white px-6 py-3">
          <div className="md:hidden">
            <Logo variant="dark" suffix={title} />
          </div>
          <span className="ml-auto text-sm text-muted">{user?.email}</span>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}