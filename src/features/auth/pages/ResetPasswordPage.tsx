import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authApi } from '../api/authApi'
import { AuthCard } from '../components/AuthCard'
import { PasswordChecklist } from '../components/PasswordChecklist'
import { resetPasswordSchema, type ResetPasswordFormValues } from '../validation/auth.schema'
import { Button } from '../../../components/ui/Button'
import { PasswordField } from '../../../components/ui/PasswordField'
import { ErrorAlert } from '../../../components/ui/Alert'
import { useToastStore } from '../../../store/toastStore'
import { applyServerFieldErrors, getErrorMessage } from '../../../services/api/apiError'

// Opened from the link in the reset email: /reset-password?email=...&token=...
export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const showToast = useToastStore((s) => s.show)
  const [formError, setFormError] = useState<string | null>(null)

  const email = searchParams.get('email') ?? ''
  const token = searchParams.get('token') ?? ''

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })
  const newPassword = useWatch({ control, name: 'newPassword' })

  const footer = (
    <Link to="/login" className="font-semibold text-primary hover:underline">
      Back to log in
    </Link>
  )

  if (!email || !token) {
    return (
      <AuthCard title="This link isn't complete" subtitle="Open the link from the email again, or ask for a new one." footer={footer}>
        <Link
          to="/forgot-password"
          className="flex w-full justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Get a new link
        </Link>
      </AuthCard>
    )
  }

  async function onSubmit(values: ResetPasswordFormValues) {
    setFormError(null)
    try {
      await authApi.resetPassword({ email, token, newPassword: values.newPassword })
      showToast({ kind: 'success', message: 'Password changed. Log in with your new password.' })
      navigate('/login', { replace: true })
    } catch (error) {
      // Weak password -> under the field. Expired or used link -> at the top.
      if (!applyServerFieldErrors(error, ['newPassword'] as const, setError)) setFormError(getErrorMessage(error))
    }
  }

  const linkExpired = formError?.includes('expired')

  return (
    <AuthCard title="Choose a new password" subtitle={`For ${email}`} footer={footer}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {formError && (
          <ErrorAlert>
            {formError}{' '}
            {linkExpired && (
              <Link to="/forgot-password" className="font-semibold underline">
                Get a new link
              </Link>
            )}
          </ErrorAlert>
        )}

        <div>
          <PasswordField label="New password" autoComplete="new-password" error={errors.newPassword?.message} {...register('newPassword')} />
          <PasswordChecklist password={newPassword} />
        </div>

        <PasswordField
          label="Confirm new password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Save new password
        </Button>
      </form>
    </AuthCard>
  )
}
