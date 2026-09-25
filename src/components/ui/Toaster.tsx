import { Link } from 'react-router-dom'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useToastStore, type ToastKind } from '../../store/toastStore'

const styles: Record<ToastKind, { icon: typeof Info; className: string }> = {
  success: { icon: CheckCircle2, className: 'text-success' },
  error: { icon: XCircle, className: 'text-danger' },
  info: { icon: Info, className: 'text-info' },
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:left-auto">
      {toasts.map((toast) => {
        const { icon: Icon, className } = styles[toast.kind]

        return (
          <div
            key={toast.id}
            role={toast.kind === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-border bg-white p-3 text-sm shadow-lg"
          >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${className}`} aria-hidden />
            <div className="flex-1">
              <p>{toast.message}</p>
              {toast.link && (
                <Link
                  to={toast.link.to}
                  onClick={() => dismiss(toast.id)}
                  className="mt-1 inline-block font-semibold text-primary hover:underline"
                >
                  {toast.link.label}
                </Link>
              )}
            </div>
            <button onClick={() => dismiss(toast.id)} className="text-muted hover:text-ink" aria-label="Dismiss">
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )
      })}
    </div>
  )
}