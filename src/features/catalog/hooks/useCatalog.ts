import { useQuery } from '@tanstack/react-query'
import { catalogApi } from '../api/catalogApi'
import type { ProductQuery } from '../../../types/catalog'

export function useProducts(query: ProductQuery) {
  return useQuery({
    queryKey: ['products', query],
    queryFn: () => catalogApi.getProducts(query),
    // While the next page, sort or price filter loads, keep showing the current results
    // (dimmed) instead of flashing skeletons. A different search, category or store starts fresh,
    // so old results never appear under a new heading.
    placeholderData: (previousData, previousQuery) => {
      const previous = previousQuery?.queryKey[1] as ProductQuery | undefined
      return previous?.search === query.search && previous?.categoryId === query.categoryId && previous?.sellerId === query.sellerId
        ? previousData
        : undefined
    },
  })
}

export function useStore(sellerId: string | undefined) {
  return useQuery({
    queryKey: ['store', sellerId],
    queryFn: () => catalogApi.getStore(sellerId!),
    enabled: !!sellerId,
  })
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => catalogApi.getProduct(id!),
    enabled: !!id,
  })
}

// Categories rarely change, so they are cached for 10 minutes.
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: catalogApi.getCategories,
    staleTime: 10 * 60 * 1000,
  })
}
