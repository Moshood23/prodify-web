import { Boxes, ClipboardList, LayoutDashboard, Package, Settings, Wallet } from 'lucide-react'
import { DashboardLayout, type DashboardNavItem } from './DashboardLayout/DashboardLayout'

const sellerNav: DashboardNavItem[] = [
  { label: 'Dashboard', to: '/seller', icon: LayoutDashboard },
  { label: 'Products', to: '/seller/products', icon: Package },
  { label: 'Inventory', to: '/seller/inventory', icon: Boxes },
  { label: 'Orders', to: '/seller/orders', icon: ClipboardList },
  { label: 'Payouts', to: '/seller/payouts', icon: Wallet },
  { label: 'Settings', to: '/seller/settings', icon: Settings },
]

export function SellerLayout() {
  return <DashboardLayout title="seller" navItems={sellerNav} />
}