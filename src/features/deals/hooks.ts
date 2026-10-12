import { useEffect, useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminFlashSalesApi, dealsApi, sellerFlashSalesApi } from './dealsApi'
import type { FlashSaleFilter, NewFlashSale } from '../../types/flashSale'

export function useDeals() {
  // Sold counts change while people shop, so refresh now and then.
  return useQuery({ queryKey: ['deals'], queryFn: dealsApi.get, staleTime: 30 * 1000, refetchInterval: 60 * 1000 })
}

// The current time, ticking every second, for countdowns.
export function useNow() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  return now
}

// A sale changes the deals, product pages, the cart and the seller's and admin's lists.
function useRefreshAfterFlashSale() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['deals'] })
    void queryClient.invalidateQueries({ queryKey: ['seller', 'flash-sales'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'flash-sales'] })
    void queryClient.invalidateQueries({ queryKey: ['products'] })
    void queryClient.invalidateQueries({ queryKey: ['product'] })
  }
}

export function useSellerFlashSales(state: FlashSaleFilter) {
  return useQuery({
    queryKey: ['seller', 'flash-sales', state],
    queryFn: () => sellerFlashSalesApi.list(state),
    placeholderData: keepPreviousData,
  })
}

export function useCreateFlashSale() {
  const refresh = useRefreshAfterFlashSale()
  return useMutation({ mutationFn: (sale: NewFlashSale) => sellerFlashSalesApi.create(sale), onSuccess: refresh })
}

export function useCancelFlashSale() {
  const refresh = useRefreshAfterFlashSale()
  return useMutation({ mutationFn: (id: string) => sellerFlashSalesApi.cancel(id), onSuccess: refresh })
}

export function useAdminFlashSales(state: FlashSaleFilter) {
  return useQuery({
    queryKey: ['admin', 'flash-sales', state],
    queryFn: () => adminFlashSalesApi.list(state),
    placeholderData: keepPreviousData,
  })
}

// approve, reject (with a reason) or stop early (with a reason).
export function useAdminFlashSaleDecision() {
  const refresh = useRefreshAfterFlashSale()
  return useMutation({
    mutationFn: ({ id, action, note }: { id: string; action: 'approve' | 'reject' | 'stop'; note?: string }) =>
      action === 'approve'
        ? adminFlashSalesApi.approve(id)
        : action === 'reject'
          ? adminFlashSalesApi.reject(id, note ?? '')
          : adminFlashSalesApi.stop(id, note ?? ''),
    onSuccess: refresh,
  })
}
