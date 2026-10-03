import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { wishlistApi } from './wishlistApi'
import { useAuthStore } from '../../store/authStore'
import { useToastStore } from '../../store/toastStore'
import { getErrorMessage } from '../../services/api/apiError'

const idsKey = ['wishlist', 'ids']

export function useWishlist(pageNumber: number, pageSize: number) {
  return useQuery({
    queryKey: ['wishlist', 'page', pageNumber, pageSize],
    queryFn: () => wishlistApi.getPage(pageNumber, pageSize),
    placeholderData: keepPreviousData,
  })
}

// Which products are saved, to fill in the hearts. Only customers have a wishlist.
function useWishlistIds() {
  const isCustomer = useAuthStore((s) => s.user?.roles.includes('Customer') ?? false)
  return useQuery({ queryKey: idsKey, queryFn: wishlistApi.getIds, enabled: isCustomer, staleTime: 60 * 1000 })
}

export function useWishlistToggle(productId: string, productName: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const showToast = useToastStore((s) => s.show)
  const { data: ids } = useWishlistIds()
  const saved = ids?.includes(productId) ?? false

  const mutation = useMutation({
    mutationFn: (save: boolean) => (save ? wishlistApi.save(productId) : wishlistApi.remove(productId)),
    // The heart changes straight away; it goes back if the request fails.
    onMutate: async (save) => {
      await queryClient.cancelQueries({ queryKey: idsKey })
      const previous = queryClient.getQueryData<string[]>(idsKey)
      queryClient.setQueryData<string[]>(idsKey, (current = []) =>
        save ? [...current.filter((id) => id !== productId), productId] : current.filter((id) => id !== productId),
      )
      return { previous }
    },
    onSuccess: (_, save) => {
      if (save) showToast({ kind: 'success', message: `${productName} saved`, link: { to: '/account/wishlist', label: 'View saved items' } })
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(idsKey, context?.previous)
      showToast({ kind: 'error', message: getErrorMessage(error, 'Could not update your saved items.') })
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
  })

  function toggle() {
    // Guests log in first and come straight back to this page.
    if (!user) {
      const returnTo = encodeURIComponent(location.pathname + location.search)
      navigate(`/login?returnTo=${returnTo}`)
      return
    }
    if (!user.roles.includes('Customer')) {
      showToast({ kind: 'error', message: 'Only customer accounts can save items.' })
      return
    }
    mutation.mutate(!saved)
  }

  return { saved, toggle, isPending: mutation.isPending }
}
