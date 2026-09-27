import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sellerOrdersApi } from '../api/sellerOrdersApi'
import type { SellerOrderQuery, SellerOrderStatusChange } from '../../../types/sellerOrder'

export function useSellerOrders(query: SellerOrderQuery) {
  return useQuery({
    queryKey: ['seller', 'orders', query],
    queryFn: () => sellerOrdersApi.list(query),
    placeholderData: keepPreviousData,
  })
}

export function useSellerOrderCounts() {
  return useQuery({ queryKey: ['seller', 'orders', 'counts'], queryFn: sellerOrdersApi.counts })
}

export function useSellerOrder(id: string | undefined) {
  return useQuery({ queryKey: ['seller', 'order', id], queryFn: () => sellerOrdersApi.get(id!), enabled: !!id })
}

// Lists, counts and stock (a cancelled order puts its items back) all change.
export function useChangeSellerOrderStatus(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (change: SellerOrderStatusChange) => sellerOrdersApi.changeStatus(id, change),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['seller'] })
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}