import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi, type CustomerListQuery, type SellerAction, type SellerListQuery } from './api/adminApi'
import { sellerProductsApi } from '../seller-portal/api/sellerProductsApi'
import { sellerOrdersApi } from '../seller-portal/api/sellerOrdersApi'
import type { AdminOrderQuery, AdminReviewQuery } from '../../types/admin'
import type { ManagedProductQuery } from '../../types/sellerProduct'
import type { SellerOrderQuery } from '../../types/sellerOrder'

export function useAdminDashboard() {
  return useQuery({ queryKey: ['admin', 'dashboard'], queryFn: adminApi.getDashboard })
}

export function useAdminSellers(query: SellerListQuery) {
  return useQuery({
    queryKey: ['admin', 'sellers', query],
    queryFn: () => adminApi.getSellers(query),
    placeholderData: keepPreviousData,
  })
}

export function useAdminSeller(id: string | undefined) {
  return useQuery({ queryKey: ['admin', 'seller', id], queryFn: () => adminApi.getSeller(id!), enabled: !!id })
}

export function useChangeSellerStatus(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ action, reason }: { action: SellerAction; reason?: string }) => adminApi.changeSellerStatus(id, action, reason),
    // Counts, lists and the store's visibility in the shop all change.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin'] })
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useCancelAdminOrder(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reason: string) => adminApi.cancelOrder(id, reason),
    // Order lists, dashboard numbers and stock in the shop all change.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin'] })
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useUpdateDeliveryFee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ state, fee }: { state: string; fee: number }) => adminApi.updateDeliveryFee(state, fee),
    // Checkout reads the same list.
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['delivery-fees'] }),
  })
}

export function useAdminOrders(query: AdminOrderQuery) {
  return useQuery({ queryKey: ['admin', 'orders', query], queryFn: () => adminApi.getOrders(query), placeholderData: keepPreviousData })
}

export function useAdminOrder(id: string | undefined) {
  return useQuery({ queryKey: ['admin', 'order', id], queryFn: () => adminApi.getOrder(id!), enabled: !!id })
}

export function useAdminCustomers(query: CustomerListQuery) {
  return useQuery({ queryKey: ['admin', 'customers', query], queryFn: () => adminApi.getCustomers(query), placeholderData: keepPreviousData })
}

export function useAdminCustomer(id: string | undefined) {
  return useQuery({ queryKey: ['admin', 'customer', id], queryFn: () => adminApi.getCustomer(id!), enabled: !!id })
}

// Products and seller orders use the Seller Centre endpoints, which admins can call for any seller.
export function useAdminProducts(query: ManagedProductQuery) {
  return useQuery({ queryKey: ['admin', 'products', query], queryFn: () => sellerProductsApi.list(query), placeholderData: keepPreviousData })
}

export function useSetProductActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => sellerProductsApi.setActive(id, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin'] })
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useAdminSellerOrders(query: SellerOrderQuery) {
  return useQuery({ queryKey: ['admin', 'seller-orders', query], queryFn: () => sellerOrdersApi.list(query), placeholderData: keepPreviousData })
}

export function useManagedCategories() {
  return useQuery({ queryKey: ['admin', 'categories'], queryFn: adminApi.getCategories })
}

export function useManagedBrands() {
  return useQuery({ queryKey: ['admin', 'brands'], queryFn: adminApi.getBrands })
}

// Any catalog change: reload the admin lists and the shop's category and brand lists.
export function useCatalogMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin'] })
      void queryClient.invalidateQueries({ queryKey: ['categories'] })
      void queryClient.invalidateQueries({ queryKey: ['brands'] })
    },
  })
}
export function useAdminReviews(query: AdminReviewQuery) {
  return useQuery({ queryKey: ['admin', 'reviews', query], queryFn: () => adminApi.getReviews(query), placeholderData: keepPreviousData })
}

// Hiding or showing a review changes the product's rating in the shop too.
export function useSetReviewHidden() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => (reason === undefined ? adminApi.unhideReview(id) : adminApi.hideReview(id, reason)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] })
      void queryClient.invalidateQueries({ queryKey: ['product'] })
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
