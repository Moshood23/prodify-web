import { lazy, Suspense, type ComponentType } from 'react'
import { Outlet, Route, Routes } from 'react-router-dom'
import { CustomerLayout } from '../../layouts/CustomerLayout/CustomerLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { HomePage } from '../../features/catalog/pages/HomePage'
import { ProductListPage } from '../../features/catalog/pages/ProductListPage'
import { ProductDetailsPage } from '../../features/catalog/pages/ProductDetailsPage'
import { StorePage } from '../../features/catalog/pages/StorePage'
import { CartPage } from '../../features/cart/pages/CartPage'
import { ApprovedSellerOnly } from '../../features/seller-portal/components/ApprovedSellerOnly'
import { ComingSoonPage } from '../../pages/ComingSoonPage'
import { ForbiddenPage } from '../../pages/ForbiddenPage'
import { NotFoundPage } from '../../pages/NotFoundPage'
import { PageLoading } from '../../components/ui/PageLoading'

// The storefront pages above load straight away. The rest are downloaded the first time
// someone opens them, so shoppers don't download the seller and admin portals.
function page<K extends string>(load: () => Promise<Record<K, ComponentType>>, name: K) {
  return lazy(() => load().then((m) => ({ default: m[name] })))
}

// Sign-in pages
const LoginPage = page(() => import('../../features/auth/pages/LoginPage'), 'LoginPage')
const RegisterPage = page(() => import('../../features/auth/pages/RegisterPage'), 'RegisterPage')
const ForgotPasswordPage = page(() => import('../../features/auth/pages/ForgotPasswordPage'), 'ForgotPasswordPage')
const ResetPasswordPage = page(() => import('../../features/auth/pages/ResetPasswordPage'), 'ResetPasswordPage')

// Checkout and my account
const WishlistPage = page(() => import('../../features/wishlist/pages/WishlistPage'), 'WishlistPage')
const CheckoutPage = page(() => import('../../features/checkout/pages/CheckoutPage'), 'CheckoutPage')
const OrdersPage = page(() => import('../../features/orders/pages/OrdersPage'), 'OrdersPage')
const OrderDetailsPage = page(() => import('../../features/orders/pages/OrderDetailsPage'), 'OrderDetailsPage')
const AccountLayout = page(() => import('../../features/account/components/AccountLayout'), 'AccountLayout')
const AccountOverviewPage = page(() => import('../../features/account/pages/AccountOverviewPage'), 'AccountOverviewPage')
const AddressesPage = page(() => import('../../features/account/pages/AddressesPage'), 'AddressesPage')
const ProfilePage = page(() => import('../../features/account/pages/ProfilePage'), 'ProfilePage')
const ChangePasswordPage = page(() => import('../../features/account/pages/ChangePasswordPage'), 'ChangePasswordPage')
const BecomeSellerPage = page(() => import('../../features/seller-portal/pages/BecomeSellerPage'), 'BecomeSellerPage')

// Seller portal
const SellerLayout = page(() => import('../../layouts/SellerLayout'), 'SellerLayout')
const SellerDashboardPage = page(() => import('../../features/seller-portal/dashboard/SellerDashboardPage'), 'SellerDashboardPage')
const SellerEarningsPage = page(() => import('../../features/payouts/pages/SellerEarningsPage'), 'SellerEarningsPage')
const SellerProductsPage = page(() => import('../../features/seller-portal/products/pages/SellerProductsPage'), 'SellerProductsPage')
const NewProductPage = page(() => import('../../features/seller-portal/products/pages/NewProductPage'), 'NewProductPage')
const EditProductPage = page(() => import('../../features/seller-portal/products/pages/EditProductPage'), 'EditProductPage')
const SellerOrdersPage = page(() => import('../../features/seller-portal/orders/pages/SellerOrdersPage'), 'SellerOrdersPage')
const SellerOrderDetailsPage = page(
  () => import('../../features/seller-portal/orders/pages/SellerOrderDetailsPage'),
  'SellerOrderDetailsPage',
)

// Admin portal
const AdminLayout = page(() => import('../../layouts/AdminLayout'), 'AdminLayout')
const AdminDashboardPage = page(() => import('../../features/admin/dashboard/AdminDashboardPage'), 'AdminDashboardPage')
const AdminSellersPage = page(() => import('../../features/admin/sellers/AdminSellersPage'), 'AdminSellersPage')
const AdminSellerDetailsPage = page(() => import('../../features/admin/sellers/AdminSellerDetailsPage'), 'AdminSellerDetailsPage')
const AdminOrdersPage = page(() => import('../../features/admin/orders/AdminOrdersPage'), 'AdminOrdersPage')
const AdminOrderDetailsPage = page(() => import('../../features/admin/orders/AdminOrderDetailsPage'), 'AdminOrderDetailsPage')
const AdminCustomersPage = page(() => import('../../features/admin/customers/AdminCustomersPage'), 'AdminCustomersPage')
const AdminCustomerDetailsPage = page(() => import('../../features/admin/customers/AdminCustomerDetailsPage'), 'AdminCustomerDetailsPage')
const AdminProductsPage = page(() => import('../../features/admin/products/AdminProductsPage'), 'AdminProductsPage')
const AdminCatalogPage = page(() => import('../../features/admin/catalog/AdminCatalogPage'), 'AdminCatalogPage')
const AdminDeliveryFeesPage = page(() => import('../../features/admin/delivery/AdminDeliveryFeesPage'), 'AdminDeliveryFeesPage')
const AdminReviewsPage = page(() => import('../../features/admin/reviews/AdminReviewsPage'), 'AdminReviewsPage')
const AdminPayoutsPage = page(() => import('../../features/payouts/pages/AdminPayoutsPage'), 'AdminPayoutsPage')
const AdminSettingsPage = page(() => import('../../features/payouts/pages/AdminSettingsPage'), 'AdminSettingsPage')

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        {/* Pages without the shop header */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Customer storefront */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<ProductListPage />} />
          <Route path="/category/:categoryId" element={<ProductListPage />} />
          <Route path="/products/:productId" element={<ProductDetailsPage />} />
          <Route path="/store/:sellerId" element={<StorePage />} />
          <Route path="/cart" element={<CartPage />} />

          {/* Customer account pages */}
          <Route
            element={
              <ProtectedRoute roles={['Customer']}>
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/sell" element={<BecomeSellerPage />} />

            {/* My account: sidebar + page */}
            <Route element={<AccountLayout />}>
              <Route path="/account" element={<AccountOverviewPage />} />
              <Route path="/account/wishlist" element={<WishlistPage />} />
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
          <Route path="earnings" element={<SellerEarningsPage />} />

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
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="payouts" element={<AdminPayoutsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="*" element={<ComingSoonPage title="Admin" />} />
        </Route>
      </Routes>
    </Suspense>
  )
}