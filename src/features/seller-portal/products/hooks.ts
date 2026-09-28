import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sellerProductsApi } from '../api/sellerProductsApi'
import { catalogApi } from '../../catalog/api/catalogApi'
import type { ManagedProductQuery } from '../../../types/sellerProduct'

export function useManagedProducts(query: ManagedProductQuery) {
  return useQuery({
    queryKey: ['seller', 'products', query],
    queryFn: () => sellerProductsApi.list(query),
    placeholderData: keepPreviousData,
  })
}

export function useManagedProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['seller', 'product', id],
    queryFn: () => sellerProductsApi.get(id!),
    enabled: !!id,
  })
}

export function useBrands() {
  return useQuery({ queryKey: ['brands'], queryFn: catalogApi.getBrands, staleTime: 10 * 60 * 1000 })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sellerProductsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seller', 'products'] }),
  })
}

// Every change to a product: reload the Seller Centre views and the shop's cached copies.
export function useProductMutation<TVariables, TData = unknown>(productId: string, mutationFn: 
(variables: TVariables) => Promise<TData>) 
{  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['seller'] })
      void queryClient.invalidateQueries({ queryKey: ['products'] })
      void queryClient.invalidateQueries({ queryKey: ['product', productId] })
    },
  })
}