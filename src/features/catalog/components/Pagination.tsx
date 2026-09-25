import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

// Page numbers to show: first, last, and the current page with its neighbours.
// e.g. page 6 of 12 -> [1, '…', 5, 6, 7, '…', 12]
function visiblePages(page: number, totalPages: number): (number | '…')[] {
  const pages = new Set([1, totalPages, page - 1, page, page + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)

  const result: (number | '…')[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('…')
    result.push(p)
  })
  return result
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const buttonClass =
    'flex h-9 min-w-9 items-center justify-center rounded-lg border border-border bg-white px-2 text-sm hover:border-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border'

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5">
      <button className={buttonClass} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </button>

      {visiblePages(page, totalPages).map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-1 text-muted">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`${buttonClass} ${p === page ? 'border-primary bg-primary text-white hover:border-primary' : ''}`}
          >
            {p}
          </button>
        ),
      )}

      <button className={buttonClass} disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </nav>
  )
}