import { Route, Routes } from 'react-router-dom'
import { CustomerLayout } from '../../layouts/CustomerLayout/CustomerLayout'
import { SellerLayout } from '../../layouts/SellerLayout'
import { AdminLayout } from '../../layouts/AdminLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { HomePage } from '../../features/catalog/pages/HomePage'
import { LoginPage } from '../../features/auth/pages/LoginPage'
import { RegisterPage } from '../../features/auth/pages/RegisterPage'
import { SellerDashboardPage } from '../../features/seller-portal/dashboard/SellerDashboardPage'
import { AdminDashboardPage } from '../../features/admin/dashboard/AdminDashboardPage'
import { ComingSoonPage } from '../../pages/ComingSoonPage'
import { ForbiddenPage } from '../../pages/ForbiddenPage'
import { NotFoundPage } from '../../pages/NotFoundPage'

export function AppRoutes() {
  return (
    <Routes>
      {/* Pages without the shop header */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Customer storefront */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/cart"
          element={
            <ProtectedRoute roles={['Customer']}>
              <ComingSoonPage title="Your cart" />
            </ProtectedRoute>
          }
        />
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Seller portal */}
      <Route
        path="/seller"
        element={
          <ProtectedRoute roles={['Seller']}>
            <SellerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SellerDashboardPage />} />
        <Route path="*" element={<ComingSoonPage title="Seller Centre" />} />
      </Route>

      {/* Admin portal */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['Admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="*" element={<ComingSoonPage title="Admin" />} />
      </Route>
    </Routes>
  )
}