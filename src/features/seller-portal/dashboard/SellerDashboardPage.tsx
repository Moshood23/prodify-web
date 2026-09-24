import { useAuthStore } from '../../../store/authStore'

export function SellerDashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div>
      <h1 className="text-2xl font-bold">Seller dashboard</h1>
      <p className="mt-1 text-sm text-muted">Signed in as {user?.email}. Sales, orders and stock will appear here.</p>
    </div>
  )
}