import { ClipboardList, LayoutDashboard, Package, Settings, Store, Tags, Users } from 'lucide-react'
import { DashboardLayout, type DashboardNavItem } from './DashboardLayout/DashboardLayout'

const adminNav: DashboardNavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Sellers', to: '/admin/sellers', icon: Store },
  { label: 'Customers', to: '/admin/customers', icon: Users },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Categories', to: '/admin/categories', icon: Tags },
  { label: 'Orders', to: '/admin/orders', icon: ClipboardList },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
]

export function AdminLayout() {
  return <DashboardLayout title="admin" navItems={adminNav} />
}