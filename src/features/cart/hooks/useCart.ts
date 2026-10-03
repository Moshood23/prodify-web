import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cartApi } from '../api/cartApi'
import { useAuthStore } from '../../../store/authStore'
import { useGuestCartStore, MAX_QUANTITY_PER_ITEM } from '../../../store/guestCartStore'
import { useToastStore } from '../../../store/toastStore'
import { getErrorMessage } from '../../../services/api/apiError'
import type { Cart } from '../../../types/order'

const emptyCart: Cart = { id: null, total: 0, itemCount: 0, hasProblems: false, items: [] }

// Logged-out shoppers have a guest cart kept in the browser; customers have one on the server.
function useIsGuest() {
  return useAuthStore((s) => s.user === null)
}

// Only customers and guests have a cart.
export function useCart() {
  const isGuest = useIsGuest()
  const isCustomer = useAuthStore((s) => s.user?.roles.includes('Customer') ?? false)
  const guestItems = useGuestCartStore((s) => s.items)

  const customerCart = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    enabled: isCustomer,
  })

  // Priced by the API, so prices and stock are always current.
  const guestCart = useQuery({
    queryKey: ['cart', 'guest', guestItems],
    queryFn: () => (guestItems.length === 0 ? Promise.resolve(emptyCart) : cartApi.preview(guestItems)),
    enabled: isGuest,
    placeholderData: keepPreviousData,
  })

  return isGuest ? guestCart : customerCart
}

export function useCartCount(): number {
  const isGuest = useIsGuest()
  const guestCount = useGuestCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))
  const { data } = useCart()
  return isGuest ? guestCount : (data?.itemCount ?? 0)
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient()
  const showToast = useToastStore((s) => s.show)
  const isGuest = useIsGuest()
  const setGuestQuantity = useGuestCartStore((s) => s.setQuantity)

  return useMutation({
    // A guest cart item's id is its variant id.
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) =>
      isGuest ? setGuestQuantity(cartItemId, quantity) : cartApi.updateQuantity(cartItemId, quantity),
    onError: (error) => showToast({ kind: 'error', message: getErrorMessage(error, 'Could not update the quantity.') }),
    // Refetch either way: on error the cart shows the real quantity and stock again.
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  })
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient()
  const showToast = useToastStore((s) => s.show)
  const isGuest = useIsGuest()
  const removeGuestItem = useGuestCartStore((s) => s.remove)

  return useMutation({
    mutationFn: async ({ cartItemId }: { cartItemId: string; productName: string }) =>
      isGuest ? removeGuestItem(cartItemId) : cartApi.removeItem(cartItemId),
    onSuccess: (_, { productName }) => showToast({ kind: 'info', message: `${productName} removed from your cart` }),
    onError: (error) => showToast({ kind: 'error', message: getErrorMessage(error, 'Could not remove this item.') }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  })
}

interface AddToCartInput {
  productVariantId: string
  quantity?: number
  productName: string
}

export function useAddToCart() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const showToast = useToastStore((s) => s.show)
  const addGuestItem = useGuestCartStore((s) => s.add)

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

  function addToCart({ productVariantId, quantity = 1, productName }: AddToCartInput) {
    // Guests shop without an account; they log in at checkout.
    if (!user) {
      if (addGuestItem(productVariantId, quantity) === 0) {
        showToast({ kind: 'error', message: `You can buy at most ${MAX_QUANTITY_PER_ITEM} of ${productName} per order.` })
        return
      }
      showToast({ kind: 'success', message: `${productName} added to your cart`, link: { to: '/cart', label: 'View cart' } })
      return
    }

    if (!user.roles.includes('Customer')) {
      showToast({ kind: 'error', message: 'Only customer accounts can shop. Log in with a customer account to add items to a cart.' })
      return
    }

    mutation.mutate({ productVariantId, quantity, productName })
  }

  return {
    addToCart,
    isAdding: mutation.isPending,
    // Which variant is being added, so only that button shows a spinner.
    addingVariantId: mutation.isPending ? mutation.variables?.productVariantId : undefined,
  }
}

// Right after logging in or signing up: moves the guest cart into the account cart.
// Never blocks the login; if it fails, the guest cart stays in the browser.
export function useMergeGuestCart() {
  const queryClient = useQueryClient()
  const showToast = useToastStore((s) => s.show)

  return async function mergeGuestCart() {
    const { items, clear } = useGuestCartStore.getState()
    const isCustomer = useAuthStore.getState().user?.roles.includes('Customer') ?? false
    if (items.length === 0 || !isCustomer) return

    try {
      const notes = await cartApi.merge(items)
      clear()
      await queryClient.invalidateQueries({ queryKey: ['cart'] })
      showToast(
        notes.length > 0
          ? { kind: 'info', message: `We moved your cart to your account. ${notes.join(' ')}`, link: { to: '/cart', label: 'View cart' } }
          : { kind: 'success', message: 'We moved your cart to your account.', link: { to: '/cart', label: 'View cart' } },
      )
    } catch (error) {
      showToast({ kind: 'error', message: getErrorMessage(error, 'Could not move your cart to your account. Your items are still saved.') })
    }
  }
}