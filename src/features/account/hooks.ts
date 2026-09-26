import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { accountApi, type AddressInput, type ProfileInput } from './api/accountApi'
import { useToastStore } from '../../store/toastStore'
import { getErrorMessage } from '../../services/api/apiError'

// Same key as checkout, so a new address saved in one place shows up in the other.
const ME = ['me']

export function useMe() {
  return useQuery({ queryKey: ME, queryFn: accountApi.getMe })
}

// Small address actions: show a message either way and reload the account.
function useAddressAction<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>, successMessage: string) {
  const queryClient = useQueryClient()
  const showToast = useToastStore((s) => s.show)

  return useMutation({
    mutationFn,
    onSuccess: () => showToast({ kind: 'success', message: successMessage }),
    onError: (error) => showToast({ kind: 'error', message: getErrorMessage(error) }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ME }),
  })
}

export function useDeleteAddress() {
  return useAddressAction((id: string) => accountApi.deleteAddress(id), 'Address deleted')
}

export function useSetDefaultAddress() {
  return useAddressAction((id: string) => accountApi.setDefaultAddress(id), 'Default address updated')
}

export function useSaveAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, address, setAsDefault }: { id?: string; address: AddressInput; setAsDefault: boolean }) => {
      if (id) await accountApi.updateAddress(id, address)
      else await accountApi.addAddress({ ...address, setAsDefault })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ME }),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (profile: ProfileInput) => accountApi.updateProfile(profile),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ME }),
  })
}