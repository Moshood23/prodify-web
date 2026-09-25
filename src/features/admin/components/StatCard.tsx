import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  hint?: string
  to?: string
  highlight?: boolean
}

export function StatCard({ label, value, icon: Icon, hint, to, highlight }: StatCardProps) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${highlight ? 'bg-accent text-ink' : 'bg-primary-light text-primary'}`}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </>
  )

  const className = `block rounded-xl border bg-white p-4 ${highlight ? 'border-accent' : 'border-border'} ${to ? 'hover:border-primary' : ''}`
  return to ? (
    <Link to={to} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  )
}