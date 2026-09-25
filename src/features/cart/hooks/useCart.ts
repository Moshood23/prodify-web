import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { cartApi } from '../api/cartApi'
import { useAuthStore } from '../../../store/authStore'
import { useToastStore } from '../../../store/toastStore'
import { getErrorMessage } from '../../../services/api/apiError'

// Only customer accounts have a cart.
export function useCart() {
  const isCustomer = useAuthStore((s) => s.user?.roles.includes('Customer') ?? false)

  return useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    enabled: isCustomer,
  })
}

export function useCartCount(): number {
  const { data } = useCart()
  return data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
}

interface AddToCartInput {
  productVariantId: string
  quantity?: number
  productName: string
}

export function useAddToCart() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const showToast = useToastStore((s) => s.show)

  const mutation = useMutation({
    mutationFn: ({ productVariantId, quantity = 1 }: AddToCartInput) => cartApi.addItem(productVariantId, quantity),
    onSuccess: (_, { productName }) => {
      void queryClient.invalidateQueries({ queryKey: ['cart'] })
      showToast({ kind: 'success', message: `${productName} added to your cart`, link: { to: '/cart', label: 'View cart' } })
    },
    onError: (error) => {
      showToast({ kind: 'error', message: getErrorMessage(error, 'Could not add this item to your cart.') })
    },
  })

  function addToCart(input: AddToCartInput) {
    // Guests log in first and come straight back to this page.
    if (!user) {
      const returnTo = encodeURIComponent(location.pathname + location.search)
      navigate(`/login?returnTo=${returnTo}`)
      return
    }

    if (!user.roles.includes('Customer')) {
      showToast({ kind: 'error', message: 'Only customer accounts can shop. Log in with a customer account to add items to a cart.' })
      return
    }

    mutation.mutate(input)
  }

  return {
    addToCart,
    isAdding: mutation.isPending,
    // Which variant is being added, so only that button shows a spinner.
    addingVariantId: mutation.isPending ? mutation.variables?.productVariantId : undefined,
  }
}