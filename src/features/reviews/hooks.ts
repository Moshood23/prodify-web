import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { catalogApi } from '../catalog/api/catalogApi'
import { useAuthStore } from '../../store/authStore'
import type { ReviewInput } from '../../types/catalog'

export function useProductReviews(productId: string, pageSize: number) {
  // The answer includes "your review", so it differs per logged-in user.
  const userId = useAuthStore((s) => s.user?.id ?? null)
  return useQuery({
    queryKey: ['product', productId, 'reviews', pageSize, userId],
    queryFn: () => catalogApi.getReviews(productId, pageSize),
    placeholderData: (previous) => previous,
  })
}

export function useSubmitReview(productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (review: ReviewInput) => catalogApi.submitReview(productId, review),
    // The product's average and the shop lists change too.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['product', productId] })
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
