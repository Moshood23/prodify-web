import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi, type SellerAction, type SellerListQuery } from './api/adminApi'

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