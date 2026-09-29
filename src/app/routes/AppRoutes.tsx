import { Outlet, Route, Routes } from 'react-router-dom'
import { CustomerLayout } from '../../layouts/CustomerLayout/CustomerLayout'
import { SellerLayout } from '../../layouts/SellerLayout'
import { AdminLayout } from '../../layouts/AdminLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { HomePage } from '../../features/catalog/pages/HomePage'
import { ProductListPage } from '../../features/catalog/pages/ProductListPage'
import { ProductDetailsPage } from '../../features/catalog/pages/ProductDetailsPage'
import { CartPage } from '../../features/cart/pages/CartPage'
import { CheckoutPage } from '../../features/checkout/pages/CheckoutPage'
import { OrdersPage } from '../../features/orders/pages/OrdersPage'
import { OrderDetailsPage } from '../../features/orders/pages/OrderDetailsPage'
import { LoginPage } from '../../features/auth/pages/LoginPage'
import { RegisterPage } from '../../features/auth/pages/RegisterPage'
import { SellerDashboardPage } from '../../features/seller-portal/dashboard/SellerDashboardPage'
import { AdminDashboardPage } from '../../features/admin/dashboard/AdminDashboardPage'
import { AdminSellersPage } from '../../features/admin/sellers/AdminSellersPage'
import { AdminSellerDetailsPage } from '../../features/admin/sellers/AdminSellerDetailsPage'
import { AdminOrdersPage } from '../../features/admin/orders/AdminOrdersPage'
import { AdminOrderDetailsPage } from '../../features/admin/orders/AdminOrderDetailsPage'
import { AdminCustomersPage } from '../../features/admin/customers/AdminCustomersPage'
import { AdminCustomerDetailsPage } from '../../features/admin/customers/AdminCustomerDetailsPage'
import { AdminProductsPage } from '../../features/admin/products/AdminProductsPage'
import { AdminCatalogPage } from '../../features/admin/catalog/AdminCatalogPage'
import { AdminDeliveryFeesPage } from '../../features/admin/delivery/AdminDeliveryFeesPage'
import { BecomeSellerPage } from '../../features/seller-portal/pages/BecomeSellerPage'
import { ApprovedSellerOnly } from '../../features/seller-portal/components/ApprovedSellerOnly'
import { SellerProductsPage } from '../../features/seller-portal/products/pages/SellerProductsPage'
import { NewProductPage } from '../../features/seller-portal/products/pages/NewProductPage'
import { EditProductPage } from '../../features/seller-portal/products/pages/EditProductPage'
import { SellerOrdersPage } from '../../features/seller-portal/orders/pages/SellerOrdersPage'
import { SellerOrderDetailsPage } from '../../features/seller-portal/orders/pages/SellerOrderDetailsPage'
import { AccountLayout } from '../../features/account/components/AccountLayout'
import { AccountOverviewPage } from '../../features/account/pages/AccountOverviewPage'
import { AddressesPage } from '../../features/account/pages/AddressesPage'
import { ProfilePage } from '../../features/account/pages/ProfilePage'
import { ChangePasswordPage } from '../../features/account/pages/ChangePasswordPage'
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
        <Route path="/search" element={<ProductListPage />} />
        <Route path="/category/:categoryId" element={<ProductListPage />} />
        <Route path="/products/:productId" element={<ProductDetailsPage />} />

        {/* Customer account pages */}
        <Route
          element={
            <ProtectedRoute roles={['Customer']}>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/sell" element={<BecomeSellerPage />} />

          {/* My account: sidebar + page */}
          <Route element={<AccountLayout />}>
            <Route path="/account" element={<AccountOverviewPage />} />
            <Route path="/account/addresses" element={<AddressesPage />} />
            <Route path="/account/profile" element={<ProfilePage />} />
            <Route path="/account/password" element={<ChangePasswordPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
          </Route>
        </Route>

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

        {/* Only an approved store can manage products. */}
        <Route
          element={
            <ApprovedSellerOnly>
              <Outlet />
            </ApprovedSellerOnly>
          }
        >
          <Route path="products" element={<SellerProductsPage />} />
          <Route path="products/new" element={<NewProductPage />} />
          <Route path="products/:productId" element={<EditProductPage />} />
        </Route>

        {/* Orders stay reachable for a suspended store, so it can finish what it owes. */}
        <Route path="orders" element={<SellerOrdersPage />} />
        <Route path="orders/:orderId" element={<SellerOrderDetailsPage />} />

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
        <Route path="sellers" element={<AdminSellersPage />} />
        <Route path="sellers/:sellerId" element={<AdminSellerDetailsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/:orderId" element={<AdminOrderDetailsPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="customers/:customerId" element={<AdminCustomerDetailsPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="categories" element={<AdminCatalogPage />} />
        <Route path="delivery-fees" element={<AdminDeliveryFeesPage />} />
        <Route path="*" element={<ComingSoonPage title="Admin" />} />
      </Route>
    </Routes>
  )
}