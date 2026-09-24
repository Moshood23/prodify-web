import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../../../store/authStore'
import { getErrorMessage } from '../../../services/api/apiError'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'
import { PasswordField } from '../../../components/ui/PasswordField'
import { ErrorAlert } from '../../../components/ui/Alert'
import { AuthCard } from '../components/AuthCard'
import { useRedirectAfterAuth } from '../hooks/useRedirectAfterAuth'
import { loginSchema, type LoginFormValues } from '../validation/auth.schema'

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const setSession = useAuthStore((s) => s.setSession)
  const redirectAfterAuth = useRedirectAfterAuth()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: LoginFormValues) {
    setFormError(null)

    try {
      setSession(await authApi.login(values))
      redirectAfterAuth()
    } catch (error) {
      setFormError(getErrorMessage(error))
    }
  }

  // Keep ?returnTo when switching to the register page.
  const registerLink = `/register${searchParams.toString() ? `?${searchParams}` : ''}`

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to continue shopping."
      footer={
        <>
          New to Prodify?{' '}
          <Link to={registerLink} className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {formError && <ErrorAlert>{formError}</ErrorAlert>}

        <TextField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />

        <PasswordField
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Log in
        </Button>
      </form>
    </AuthCard>
  )
}