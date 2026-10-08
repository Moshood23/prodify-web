import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../../services/api/apiClient'
import type { Voucher, VoucherInput } from '../../../types/voucher'

export function useVouchers() {
  return useQuery({
    queryKey: ['admin', 'vouchers'],
    queryFn: async () => (await apiClient.get<Voucher[]>('/admin/vouchers')).data,
  })
}

export function useCreateVoucher() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: VoucherInput) => apiClient.post<string>('/admin/vouchers', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'vouchers'] }),
  })
}

// Also used to switch a voucher on or off.
export function useUpdateVoucher() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: VoucherInput & { id: string; isActive: boolean }) => apiClient.put(`/admin/vouchers/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'vouchers'] }),
  })
}
