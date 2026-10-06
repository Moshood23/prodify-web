import { LoaderCircle } from 'lucide-react'

// Shown for a moment while a page's code downloads the first time it is opened.
export function PageLoading() {
  return (
    <div className="flex justify-center py-16" role="status" aria-label="Loading page">
      <LoaderCircle className="h-6 w-6 animate-spin text-muted" aria-hidden />
    </div>
  )
}
