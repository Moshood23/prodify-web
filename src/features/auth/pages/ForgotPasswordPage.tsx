import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MailCheck } from 'lucide-react'
import { authApi } from '../api/authApi'
import { AuthCard } from '../components/AuthCard'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../validation/auth.schema'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'
import { ErrorAlert } from '../../../components/ui/Alert'
import { getErrorMessage } from '../../../services/api/apiError'

export function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: '' } })

  async function onSubmit(values: ForgotPasswordFormValues) {
    setFormError(null)
    try {
      await authApi.forgotPassword(values.email)
      setSentTo(values.email)
    } catch (error) {
      setFormError(getErrorMessage(error))
    }
  }

  const footer = (
    <>
      Remembered it?{' '}
      <Link to="/login" className="font-semibold text-primary hover:underline">
        Log in
      </Link>
    </>
  )

  // The same message whether or not the email has an account, so the page can't be used to look accounts up.
  if (sentTo) {
    return (
      <AuthCard title="Check your email" subtitle="We've sent you a link to reset your password." footer={footer}>
        <div className="space-y-3 text-sm">
          <p className="flex gap-2 rounded-lg bg-primary-light p-3">
            <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <span>
              If an account exists for <span className="font-semibold">{sentTo}</span>, you'll get an email with a link to choose a new password. The
              link works for 1 hour.
            </span>
          </p>
          <p className="text-muted">No email after a few minutes? Check your spam folder, or try again.</p>
          <Button variant="outline" className="w-full" onClick={() => setSentTo(null)}>
            Try another email
          </Button>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Forgot your password?" subtitle="Enter your email and we'll send you a link to reset it." footer={footer}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {formError && <ErrorAlert>{formError}</ErrorAlert>}
        <TextField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Send reset link
        </Button>
      </form>
    </AuthCard>
  )
}
