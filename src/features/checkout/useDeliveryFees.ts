import { useQuery } from '@tanstack/react-query'
import { checkoutApi } from './api/checkoutApi'

// Every state's delivery fee. Shared by checkout and the admin page.
export function useDeliveryFees() {
  return useQuery({ queryKey: ['delivery-fees'], queryFn: checkoutApi.getDeliveryFees, staleTime: 5 * 60 * 1000 })
}

// The fee for one state, or undefined if we don't deliver there (or fees are still loading).
export function feeForState(fees: { state: string; fee: number }[] | undefined, state: string | undefined) {
  if (!fees || !state) return undefined
  return fees.find((f) => f.state.toLowerCase() === state.trim().toLowerCase())?.fee
}
