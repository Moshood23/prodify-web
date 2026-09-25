import { ClipboardList, LayoutDashboard, Package } from 'lucide-react'
import { DashboardLayout, type DashboardNavItem } from './DashboardLayout/DashboardLayout'

const sellerNav: DashboardNavItem[] = [
  { label: 'Dashboard', to: '/seller', icon: LayoutDashboard, end: true },
  { label: 'Products', to: '/seller/products', icon: Package },
  { label: 'Orders', to: '/seller/orders', icon: ClipboardList },
]

export function SellerLayout() {
  return <DashboardLayout title="seller" navItems={sellerNav} />
}