import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMe, useUpdateProfile } from '../hooks'
import { profileSchema, type ProfileFormValues } from '../validation/account.schema'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'
import { ErrorAlert } from '../../../components/ui/Alert'
import { useToastStore } from '../../../store/toastStore'
import { applyServerFieldErrors, getErrorMessage } from '../../../services/api/apiError'
import type { CustomerProfile } from '../../../types/order'

function ProfileForm({ me }: { me: CustomerProfile }) {
  const update = useUpdateProfile()
  const showToast = useToastStore((s) => s.show)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onTouched',
    defaultValues: { firstName: me.firstName, lastName: me.lastName, phoneNumber: me.phoneNumber ?? '' },
  })

  function onSubmit(values: ProfileFormValues) {
    update.mutate(
      { ...values, phoneNumber: values.phoneNumber || undefined },
      {
        onSuccess: () => {
          reset(values)
          showToast({ kind: 'success', message: 'Profile saved' })
        },
        onError: (error) => applyServerFieldErrors(error, ['firstName', 'lastName', 'phoneNumber'] as const, setError),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-xl space-y-4 rounded-xl border border-border bg-white p-4 sm:p-6">
      {update.error && <ErrorAlert>{getErrorMessage(update.error, 'Could not save your profile.')}</ErrorAlert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="First name" autoComplete="given-name" error={errors.firstName?.message} {...register('firstName')} />
        <TextField label="Last name" autoComplete="family-name" error={errors.lastName?.message} {...register('lastName')} />
      </div>
      <TextField label="Phone number (optional)" type="tel" autoComplete="tel" error={errors.phoneNumber?.message} {...register('phoneNumber')} />
      <TextField label="Email" value={me.email} disabled hint="Your email is used to log in and can't be changed here." readOnly />
      <Button type="submit" isLoading={update.isPending} disabled={!isDirty}>
        Save changes
      </Button>
    </form>
  )
}

export function ProfilePage() {
  const { data: me, isLoading, error } = useMe()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      {isLoading && <div className="h-48 max-w-xl animate-pulse rounded-xl bg-white" aria-busy="true" aria-label="Loading profile" />}
      {error && <ErrorAlert>{getErrorMessage(error, 'Could not load your profile.')}</ErrorAlert>}
      {me && <ProfileForm me={me} />}
    </div>
  )
}