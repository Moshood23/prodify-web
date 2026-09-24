import { Link } from 'react-router-dom'

interface LogoProps {
  // "light" for dark backgrounds (header, sidebars), "dark" for light backgrounds.
  variant?: 'light' | 'dark'
  suffix?: string
}

export function Logo({ variant = 'light', suffix }: LogoProps) {
  const text = variant === 'light' ? 'text-white' : 'text-primary'

  return (
    <Link to="/" className={`inline-flex items-baseline gap-2 text-2xl font-extrabold tracking-tight ${text}`}>
      <span>
        prodify<span className="text-accent">.</span>
      </span>
      {suffix && <span className="text-xs font-medium text-slate-400">{suffix}</span>}
    </Link>
  )
}