import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../../../store/authStore'
import { getErrorMessage } from '../../../services/api/apiError'
import { Button } from '../../../components/ui/Button'
import { Logo } from '../../../components/ui/Logo'

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setSession = useAuthStore((s) => s.setSession)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const result = await authApi.login({ email, password })
      setSession(result)

      const user = useAuthStore.getState().user
      const returnTo = searchParams.get('returnTo')
      const home = user?.roles.includes('Admin') ? '/admin' : '/'

      // Only follow relative paths, never a full URL from the query string.
      navigate(returnTo?.startsWith('/') ? returnTo : home, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Logo variant="dark" />
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h1 className="mb-1 text-xl font-bold">Welcome back</h1>
          <p className="mb-5 text-sm text-muted">Log in to continue shopping.</p>

          {error && (
            <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <label className="mb-1 block text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
          />

          <label className="mb-1 block text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-6 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
          />

          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Log in
          </Button>

          <p className="mt-4 text-center text-sm text-muted">
            New to Prodify?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}