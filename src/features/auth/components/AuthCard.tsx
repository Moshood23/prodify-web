import type { ReactNode } from 'react'
import { Logo } from '../../../components/ui/Logo'

interface AuthCardProps {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
  wide?: boolean
}

// Shared frame for the login and register pages.
export function AuthCard({ title, subtitle, children, footer, wide = false }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className={`w-full ${wide ? 'max-w-lg' : 'max-w-sm'}`}>
        <div className="mb-6 text-center">
          <Logo variant="dark" />
        </div>

        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h1 className="mb-1 text-xl font-bold">{title}</h1>
          <p className="mb-5 text-sm text-muted">{subtitle}</p>
          {children}
        </div>

        <p className="mt-4 text-center text-sm text-muted">{footer}</p>
      </div>
    </div>
  )
}