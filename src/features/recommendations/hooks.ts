import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { recommendationsApi } from './recommendationsApi'
import { recentlyViewedStorage } from './recentlyViewedStorage'

const RECENTLY_VIEWED = 'recently-viewed'
const ROW_SIZE = 12

// Customers keep their list in their account; guests (and seller or admin accounts) in the browser.
function useViewer() {
  const user = useAuthStore((s) => s.user)
  return user?.customerId ? user.id : null
}

export function useSimilarProducts(productId: string) {
  return useQuery({
    queryKey: ['similar-products', productId],
    queryFn: () => recommendationsApi.getSimilar(productId),
    staleTime: 5 * 60 * 1000,
  })
}

export function useRecentlyViewed(exclude?: string) {
  const customer = useViewer()

  return useQuery({
    queryKey: [RECENTLY_VIEWED, customer ?? 'guest', exclude ?? null],
    queryFn: async () => {
      if (customer) {
        // Products looked at before logging in join the account's list once.
        const fromBrowser = recentlyViewedStorage.list()
        if (fromBrowser.length > 0) {
          await recommendationsApi.recordViews(fromBrowser)
          recentlyViewedStorage.clear()
        }
        return recommendationsApi.getRecentlyViewed(exclude, ROW_SIZE)
      }

      const ids = recentlyViewedStorage
        .list()
        .map((v) => v.productId)
        .filter((id) => id !== exclude)
        .slice(0, ROW_SIZE)
      return recommendationsApi.getCards(ids)
    },
    staleTime: 60 * 1000,
  })
}

// Call on a product page: remembers that the shopper looked at this product.
export function useTrackProductView(productId: string | undefined) {
  const customer = useViewer()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!productId) return

    const refresh = () => void queryClient.invalidateQueries({ queryKey: [RECENTLY_VIEWED] })

    if (customer) {
      recommendationsApi
        .recordViews([{ productId }])
        .then(refresh)
        .catch(() => {
          // Not worth bothering the shopper about.
        })
    } else {
      recentlyViewedStorage.remember(productId)
      refresh()
    }
  }, [productId, customer, queryClient])
}
