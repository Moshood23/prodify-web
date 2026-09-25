import { useQuery } from '@tanstack/react-query'
import { sellerApi } from './api/sellerApi'

export function useMySeller() {
  return useQuery({ queryKey: ['seller', 'me'], queryFn: sellerApi.getMe })
}