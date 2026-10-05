import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminPayoutsApi, earningsApi } from './payoutsApi'
import type { AdminPayoutQuery, PayoutAccount, PlatformSettings } from '../../types/payout'

export function useEarnings() {
  return useQuery({ queryKey: ['seller', 'earnings'], queryFn: earningsApi.get })
}

export function useSavePayoutAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (account: PayoutAccount) => earningsApi.saveAccount(account),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seller', 'earnings'] }),
  })
}

export function useRequestPayout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (amount: number) => earningsApi.requestPayout(amount),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seller', 'earnings'] }),
  })
}

export function useAdminPayouts(query: AdminPayoutQuery) {
  return useQuery({ queryKey: ['admin', 'payouts', query], queryFn: () => adminPayoutsApi.list(query), placeholderData: keepPreviousData })
}

// Mark paid (with the bank reference) or reject (with a reason).
export function useProcessPayout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, paid, text }: { id: string; paid: boolean; text: string }) =>
      paid ? adminPayoutsApi.markPaid(id, text) : adminPayoutsApi.reject(id, text),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'payouts'] }),
  })
}

export function usePlatformSettings() {
  return useQuery({ queryKey: ['admin', 'settings'], queryFn: adminPayoutsApi.getSettings })
}

export function useUpdatePlatformSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (settings: PlatformSettings) => adminPayoutsApi.updateSettings(settings),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] }),
  })
}
