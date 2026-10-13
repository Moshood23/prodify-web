import { ClipboardList, LayoutDashboard, MessageSquare, Package, RotateCcw, Wallet, Zap } from 'lucide-react'
import { DashboardLayout, type DashboardNavItem } from './DashboardLayout/DashboardLayout'
import { useUnreadMessages } from '../features/messages/hooks'

export function SellerLayout() {
  const unread = useUnreadMessages('seller')

  const sellerNav: DashboardNavItem[] = [
    { label: 'Dashboard', to: '/seller', icon: LayoutDashboard, end: true },
    { label: 'Products', to: '/seller/products', icon: Package },
    { label: 'Orders', to: '/seller/orders', icon: ClipboardList },
    { label: 'Messages', to: '/seller/messages', icon: MessageSquare, badge: unread },
    { label: 'Returns', to: '/seller/returns', icon: RotateCcw },
    { label: 'Flash sales', to: '/seller/flash-sales', icon: Zap },
    { label: 'Earnings', to: '/seller/earnings', icon: Wallet },
  ]

  return <DashboardLayout title="seller" navItems={sellerNav} />
}
