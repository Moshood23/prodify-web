import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { MailWarning } from 'lucide-react'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../../../store/authStore'
import { useToastStore } from '../../../store/toastStore'
import { refreshSession } from '../../../services/api/apiClient'
import { getErrorMessage } from '../../../services/api/apiError'

const ALREADY_VERIFIED = 'already verified'

// Shown on the shop pages until the customer clicks the link in their welcome email.
// They can browse and fill their cart, but checking out and selling wait for it.
export function VerifyEmailBanner() {
  const user = useAuthStore((s) => s.user)
  const showToast = useToastStore((s) => s.show)
  const [sent, setSent] = useState(false)

  const resend = useMutation({
    mutationFn: authApi.resendVerificationEmail,
    onSuccess: () => setSent(true),
    onError: async (error) => {
      const message = getErrorMessage(error)
      // Verified in another tab or on another device: get a token that says so and the banner goes.
      if (message.includes(ALREADY_VERIFIED)) {
        await refreshSession()
        showToast({ kind: 'success', message: 'Your email address is already verified.' })
      } else {
        showToast({ kind: 'error', message })
      }
    },
  })

  if (!user?.customerId || user.emailVerified) return null

  return (
    <div role="status" className="border-b border-accent bg-accent-light text-sm text-ink">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
        <MailWarning className="h-5 w-5 shrink-0 text-accent-dark" aria-hidden />
        <p className="min-w-0 flex-1">
          <span className="font-semibold">Please verify your email address.</span> We sent a link to{' '}
          <span className="break-all font-medium">{user.email}</span>. You need it to place orders.
        </p>
        {sent ? (
          <p className="font-medium text-accent-dark">Sent. Check your inbox and spam folder.</p>
        ) : (
          <button
            type="button"
            onClick={() => resend.mutate()}
            disabled={resend.isPending}
            className="rounded-lg border border-accent-dark px-3 py-1.5 font-semibold text-accent-dark hover:bg-accent/20 disabled:opacity-60"
          >
            {resend.isPending ? 'Sending...' : 'Resend email'}
          </button>
        )}
      </div>
    </div>
  )
}
