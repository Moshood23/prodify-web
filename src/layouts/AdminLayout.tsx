import { ClipboardList, LayoutDashboard, Package, Store, Tags, Users } from 'lucide-react'
import { DashboardLayout, type DashboardNavItem } from './DashboardLayout/DashboardLayout'

const adminNav: DashboardNavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Sellers', to: '/admin/sellers', icon: Store },
  { label: 'Orders', to: '/admin/orders', icon: ClipboardList },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Customers', to: '/admin/customers', icon: Users },
  { label: 'Categories', to: '/admin/categories', icon: Tags },
]

export function AdminLayout() {
  return <DashboardLayout title="admin" navItems={adminNav} />
}