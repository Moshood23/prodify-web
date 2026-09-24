import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../../../store/authStore'
import { applyServerFieldErrors, getErrorMessage, getErrorStatus } from '../../../services/api/apiError'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'
import { PasswordField } from '../../../components/ui/PasswordField'
import { ErrorAlert } from '../../../components/ui/Alert'
import { AuthCard } from '../components/AuthCard'
import { PasswordChecklist } from '../components/PasswordChecklist'
import { useRedirectAfterAuth } from '../hooks/useRedirectAfterAuth'
import { registerSchema, type RegisterFormValues } from '../validation/auth.schema'

const serverFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'password'] as const

export function RegisterPage() {
  const [searchParams] = useSearchParams()
  const setSession = useAuthStore((s) => s.setSession)
  const redirectAfterAuth = useRedirectAfterAuth()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched', // show a field's error once the user has left it
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  const password = useWatch({ control, name: 'password' })

  async function onSubmit(values: RegisterFormValues) {
    setFormError(null)

    try {
      const result = await authApi.register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        phoneNumber: values.phoneNumber || undefined,
      })

      // Registration also logs the user in.
      setSession(result)
      redirectAfterAuth()
    } catch (error) {
      if (getErrorStatus(error) === 409) {
        setError('email', { type: 'server', message: 'An account with this email already exists. Try logging in instead.' })
        return
      }

      if (!applyServerFieldErrors(error, serverFields, setError)) {
        setFormError(getErrorMessage(error))
      }
    }
  }

  const loginLink = `/login${searchParams.toString() ? `?${searchParams}` : ''}`

  return (
    <AuthCard
      wide
      title="Create your account"
      subtitle="Shop from trusted sellers across Nigeria."
      footer={
        <>
          Already have an account?{' '}
          <Link to={loginLink} className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {formError && <ErrorAlert>{formError}</ErrorAlert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="First name" autoComplete="given-name" error={errors.firstName?.message} {...register('firstName')} />
          <TextField label="Last name" autoComplete="family-name" error={errors.lastName?.message} {...register('lastName')} />
        </div>

        <TextField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />

        <TextField
          label="Phone number (optional)"
          type="tel"
          autoComplete="tel"
          placeholder="0803 123 4567"
          hint="For delivery updates."
          error={errors.phoneNumber?.message}
          {...register('phoneNumber')}
        />

        <div>
          <PasswordField
            label="Password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordChecklist password={password} />
        </div>

        <PasswordField
          label="Confirm password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <div>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-primary" {...register('acceptTerms')} />
            <span>I agree to Prodify's Terms of Service and Privacy Policy.</span>
          </label>
          {errors.acceptTerms && <p className="mt-1 text-xs text-danger">{errors.acceptTerms.message}</p>}
        </div>

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Create account
        </Button>
      </form>
    </AuthCard>
  )
}