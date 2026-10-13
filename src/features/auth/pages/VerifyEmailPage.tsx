import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { authApi } from '../api/authApi'
import { AuthCard } from '../components/AuthCard'
import { ErrorAlert } from '../../../components/ui/Alert'
import { useAuthStore } from '../../../store/authStore'
import { refreshSession } from '../../../services/api/apiClient'
import { getErrorMessage } from '../../../services/api/apiError'

const buttonClass = 'flex w-full justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark'

// Opened from the link in the welcome email: /verify-email?user=...&token=...
export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const userId = searchParams.get('user') ?? ''
  const token = searchParams.get('token') ?? ''
  const complete = userId !== '' && token !== ''

  // Verifying twice is harmless, so a query is fine here (and it runs once per link).
  const verify = useQuery({
    queryKey: ['verify-email', userId, token],
    queryFn: async () => {
      await authApi.verifyEmail({ userId, token })
      // Logged in on this browser: get a token that says "verified" so the banner goes and checkout works.
      if (useAuthStore.getState().isAuthenticated) await refreshSession()
      return true
    },
    enabled: complete,
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  const footer = (
    <Link to="/" className="font-semibold text-primary hover:underline">
      Back to the shop
    </Link>
  )

  if (!complete) {
    return (
      <AuthCard title="This link isn't complete" subtitle="Open the link from the email again." footer={footer}>
        <p className="text-sm text-muted">
          Still not working? Log in and use <span className="font-semibold">Resend email</span> at the top of the page to get a new link.
        </p>
      </AuthCard>
    )
  }

  if (verify.isPending) {
    return (
      <AuthCard title="Verifying your email" subtitle="This only takes a moment." footer={footer}>
        <div className="flex justify-center py-4 text-primary">
          <Loader2 className="h-8 w-8 animate-spin" aria-label="Verifying" />
        </div>
      </AuthCard>
    )
  }

  if (verify.isError) {
    return (
      <AuthCard title="We couldn't verify your email" subtitle="Links work for 3 days." footer={footer}>
        <ErrorAlert>{getErrorMessage(verify.error)}</ErrorAlert>
        <p className="mt-4 text-sm text-muted">
          {isAuthenticated ? 'Use ' : 'Log in and use '}
          <span className="font-semibold">Resend email</span> at the top of the page to get a new link.
        </p>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Your email is verified" subtitle="Thanks! You can now place orders and apply to sell on Prodify." footer={footer}>
      <div className="mb-5 flex justify-center text-success">
        <CheckCircle2 className="h-12 w-12" aria-hidden />
      </div>
      <Link to={isAuthenticated ? '/' : '/login'} className={buttonClass}>
        {isAuthenticated ? 'Continue shopping' : 'Log in'}
      </Link>
    </AuthCard>
  )
}
