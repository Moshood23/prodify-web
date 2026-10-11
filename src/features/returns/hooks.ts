import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminReturnsApi, returnsApi, sellerReturnsApi, type ReturnFilter } from './returnsApi'
import type { NewReturn } from '../../types/returns'

// A return changes the order page, the store credit and the seller's earnings.
function useRefreshAfterReturn() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['order'] })
    void queryClient.invalidateQueries({ queryKey: ['store-credit'] })
    void queryClient.invalidateQueries({ queryKey: ['seller'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'returns'] })
  }
}

export function useRequestReturn() {
  const refresh = useRefreshAfterReturn()
  return useMutation({ mutationFn: (request: NewReturn) => returnsApi.request(request), onSuccess: refresh })
}

export function useEscalateReturn() {
  const refresh = useRefreshAfterReturn()
  return useMutation({ mutationFn: ({ id, note }: { id: string; note?: string }) => returnsApi.escalate(id, note), onSuccess: refresh })
}

export function useSellerReturns(status: ReturnFilter) {
  return useQuery({
    queryKey: ['seller', 'returns', status],
    queryFn: () => sellerReturnsApi.list(status),
    placeholderData: keepPreviousData,
  })
}

// Accept (refund now) or reject (with a reason the customer sees).
export function useSellerReturnDecision() {
  const refresh = useRefreshAfterReturn()
  return useMutation({
    mutationFn: ({ id, accept, note }: { id: string; accept: boolean; note?: string }) =>
      accept ? sellerReturnsApi.accept(id) : sellerReturnsApi.reject(id, note ?? ''),
    onSuccess: refresh,
  })
}

export function useAdminReturns(status: ReturnFilter) {
  return useQuery({
    queryKey: ['admin', 'returns', status],
    queryFn: () => adminReturnsApi.list(status),
    placeholderData: keepPreviousData,
  })
}

// Approve (refund, whatever the seller said) or decline (final, with a reason).
export function useAdminReturnDecision() {
  const refresh = useRefreshAfterReturn()
  return useMutation({
    mutationFn: ({ id, approve, note }: { id: string; approve: boolean; note?: string }) =>
      approve ? adminReturnsApi.approve(id, note) : adminReturnsApi.decline(id, note ?? ''),
    onSuccess: refresh,
  })
}
