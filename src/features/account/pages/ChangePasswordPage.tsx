import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { accountApi } from '../api/accountApi'
import { changePasswordSchema, type ChangePasswordFormValues } from '../validation/account.schema'
import { PasswordChecklist } from '../../auth/components/PasswordChecklist'
import { Button } from '../../../components/ui/Button'
import { PasswordField } from '../../../components/ui/PasswordField'
import { ErrorAlert } from '../../../components/ui/Alert'
import { useAuthStore } from '../../../store/authStore'
import { useToastStore } from '../../../store/toastStore'
import { applyServerFieldErrors, getErrorMessage } from '../../../services/api/apiError'

const fields = ['currentPassword', 'newPassword'] as const

export function ChangePasswordPage() {
  const setSession = useAuthStore((s) => s.setSession)
  const showToast = useToastStore((s) => s.show)
  const {
    register,
    handleSubmit,
    setError,
    reset,
    control,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onTouched',
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })
  const newPassword = useWatch({ control, name: 'newPassword' })

  const change = useMutation({
    mutationFn: (values: ChangePasswordFormValues) => accountApi.changePassword(values.currentPassword, values.newPassword),
    onSuccess: (tokens) => {
      // This browser stays logged in with the new tokens; other devices are logged out.
      setSession(tokens)
      reset()
      showToast({ kind: 'success', message: 'Password changed. You were logged out on your other devices.' })
    },
    onError: (error) => applyServerFieldErrors(error, fields, setError),
  })

  const hasFieldErrors = !!errors.currentPassword || !!errors.newPassword

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Change password</h1>

      <form
        onSubmit={handleSubmit((values) => change.mutate(values))}
        noValidate
        className="max-w-xl space-y-4 rounded-xl border border-border bg-white p-4 sm:p-6"
      >
        {change.error && !hasFieldErrors && <ErrorAlert>{getErrorMessage(change.error, 'Could not change your password.')}</ErrorAlert>}

        <PasswordField label="Current password" autoComplete="current-password" error={errors.currentPassword?.message} {...register('currentPassword')} />
        <div>
          <PasswordField label="New password" autoComplete="new-password" error={errors.newPassword?.message} {...register('newPassword')} />
          <PasswordChecklist password={newPassword ?? ''} />
        </div>
        <PasswordField label="Confirm new password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />

        <p className="text-xs text-muted">For your security, you will be logged out on all your other devices.</p>

        <Button type="submit" isLoading={change.isPending}>
          Change password
        </Button>
      </form>
    </div>
  )
}