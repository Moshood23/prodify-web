import { Banknote, ClipboardList, LayoutDashboard, MessageSquare, Package, RotateCcw, Settings, Store, Tags, TicketPercent, Truck, Users, Zap } from 'lucide-react'
import { DashboardLayout, type DashboardNavItem } from './DashboardLayout/DashboardLayout'

const adminNav: DashboardNavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Sellers', to: '/admin/sellers', icon: Store },
  { label: 'Orders', to: '/admin/orders', icon: ClipboardList },
  { label: 'Returns', to: '/admin/returns', icon: RotateCcw },
  { label: 'Payouts', to: '/admin/payouts', icon: Banknote },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Customers', to: '/admin/customers', icon: Users },
  { label: 'Reviews', to: '/admin/reviews', icon: MessageSquare },
  { label: 'Categories & brands', to: '/admin/categories', icon: Tags },
  { label: 'Delivery fees', to: '/admin/delivery-fees', icon: Truck },
  { label: 'Vouchers', to: '/admin/vouchers', icon: TicketPercent },
  { label: 'Flash sales', to: '/admin/flash-sales', icon: Zap },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
]

export function AdminLayout() {
  return <DashboardLayout title="admin" navItems={adminNav} />
}
