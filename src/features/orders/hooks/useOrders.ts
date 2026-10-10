import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../api/ordersApi'

export function useMyOrders(page: number) {
  return useQuery({
    queryKey: ['orders', page],
    queryFn: () => ordersApi.getMyOrders(page),
    placeholderData: keepPreviousData,
  })
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getOrder(id!),
    enabled: !!id,
  })
}

// After paying or cancelling, the order, the orders list and product stock all change.
function useRefreshOrder(orderId: string) {
  const queryClient = useQueryClient()
  return async () => {
    await queryClient.invalidateQueries({ queryKey: ['order', orderId] })
    void queryClient.invalidateQueries({ queryKey: ['orders'] })
    void queryClient.invalidateQueries({ queryKey: ['products'] })
    void queryClient.invalidateQueries({ queryKey: ['product'] })
    void queryClient.invalidateQueries({ queryKey: ['store-credit'] })
  }
}

export function useCancelOrder(orderId: string) {
  const refresh = useRefreshOrder(orderId)
  return useMutation({
    mutationFn: (reason?: string) => ordersApi.cancelOrder(orderId, reason),
    onSuccess: refresh,
  })
}

export class PaymentDeclinedError extends Error {
  constructor() {
    super('Your payment was declined. Check your card details or try another card.')
  }
}

export function usePayOrder(orderId: string) {
  const refresh = useRefreshOrder(orderId)
  return useMutation({
    // The API records a declined attempt without an error, so check whether the order is now paid.
    mutationFn: async (paymentMethodToken: string) => {
      await ordersApi.pay(orderId, paymentMethodToken)
      const order = await ordersApi.getOrder(orderId)
      if (!order.isPaid) throw new PaymentDeclinedError()
    },
    onSettled: refresh,
  })
}

export function usePaymentOptions() {
  return useQuery({
    queryKey: ['payment-options'],
    queryFn: ordersApi.paymentOptions,
    staleTime: Infinity,
  })
}

// Sends the customer to Paystack's payment page; they come back to the order page.
export function useStartPaystack(orderId: string) {
  return useMutation({
    mutationFn: () => ordersApi.startPaystack(orderId),
    onSuccess: ({ authorizationUrl }) => window.location.assign(authorizationUrl),
  })
}

// Paystack can take a moment to confirm, so keep asking for about half a minute.
const PAYSTACK_CHECKS = 10

export function usePaystackReturn(orderId: string, reference: string | null) {
  const queryClient = useQueryClient()
  const refresh = useRefreshOrder(orderId)
  const query = useQuery({
    queryKey: ['paystack', reference],
    queryFn: async () => {
      const outcome = await ordersApi.verifyPaystack(reference!)
      if (outcome.status !== 'Pending') await refresh()
      return outcome
    },
    enabled: !!reference,
    retry: false,
    staleTime: Infinity,
    refetchInterval: (q) => (q.state.data?.status === 'Pending' && q.state.dataUpdateCount < PAYSTACK_CHECKS ? 3000 : false),
  })
  const checks = queryClient.getQueryState(['paystack', reference])?.dataUpdateCount ?? 0
  return { ...query, stoppedChecking: query.data?.status === 'Pending' && checks >= PAYSTACK_CHECKS }
}
