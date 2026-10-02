import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { EyeOff, MessageSquare } from 'lucide-react'
import { useAdminReviews, useSetReviewHidden } from '../hooks'
import { useUrlFilters } from '../useUrlFilters'
import { FilterChips } from '../components/FilterChips'
import { SearchBox } from '../components/SearchBox'
import { Stars } from '../../catalog/components/Stars'
import { Pagination } from '../../catalog/components/Pagination'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'
import { ErrorAlert } from '../../../components/ui/Alert'
import { useToastStore } from '../../../store/toastStore'
import { formatDateTime } from '../../../lib/format'
import { getErrorMessage, getFieldErrors } from '../../../services/api/apiError'
import type { AdminReview, AdminReviewStatus } from '../../../types/admin'

const statuses: { value?: AdminReviewStatus; label: string }[] = [
  { label: 'All' },
  { value: 'visible', label: 'Visible' },
  { value: 'hidden', label: 'Hidden' },
]

type RatingFilter = '1' | '2' | '3' | '4' | '5'

const ratings: { value?: RatingFilter; label: string }[] = [
  { label: 'Any rating' },
  ...(['5', '4', '3', '2', '1'] as const).map((value) => ({ value, label: `${value} star` })),
]

function ReviewActions({ review }: { review: AdminReview }) {
  const [hiding, setHiding] = useState(false)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState<string>()
  const setHidden = useSetReviewHidden()
  const showToast = useToastStore((s) => s.show)

  function hide(e: FormEvent) {
    e.preventDefault()
    if (!reason.trim()) {
      setReasonError('Say why the review is being hidden.')
      return
    }
    setHidden.mutate(
      { id: review.id, reason: reason.trim() },
      {
        onSuccess: () => {
          showToast({ kind: 'success', message: 'Review hidden from the shop' })
          setHiding(false)
          setReason('')
        },
        onError: (error) => setReasonError(Object.values(getFieldErrors(error))[0]?.[0] ?? getErrorMessage(error)),
      },
    )
  }

  if (review.isHidden) {
    return (
      <button
        onClick={() =>
          setHidden.mutate(
            { id: review.id },
            {
              onSuccess: () => showToast({ kind: 'success', message: 'Review is visible again' }),
              onError: (error) => showToast({ kind: 'error', message: getErrorMessage(error) }),
            },
          )
        }
        disabled={setHidden.isPending}
        className="text-sm font-semibold text-primary hover:underline disabled:opacity-50"
      >
        Show again
      </button>
    )
  }

  if (!hiding) {
    return (
      <button onClick={() => setHiding(true)} className="text-sm font-semibold text-danger hover:underline">
        Hide
      </button>
    )
  }

  return (
    <form onSubmit={hide} noValidate className="flex w-full flex-wrap items-start gap-2 rounded-lg bg-red-50 p-3">
      <TextField
        label="Why hide this review?"
        placeholder="e.g. Abusive language"
        maxLength={500}
        value={reason}
        onChange={(e) => {
          setReason(e.target.value)
          setReasonError(undefined)
        }}
        error={reasonError}
        className="min-w-0 flex-1"
        autoFocus
      />
      <div className="flex gap-2 sm:mt-6">
        <Button type="submit" variant="danger" isLoading={setHidden.isPending}>
          Hide review
        </Button>
        <Button type="button" variant="outline" onClick={() => setHiding(false)} disabled={setHidden.isPending}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export function AdminReviewsPage() {
  const filters = useUrlFilters()
  const search = filters.get('q')
  const status = filters.get('status') as AdminReviewStatus | undefined
  const rating = filters.get('rating') as RatingFilter | undefined
  const { data, isLoading, isFetching, error } = useAdminReviews({
    search,
    status,
    rating: rating ? Number(rating) : undefined,
    pageNumber: filters.page,
    pageSize: 20,
  })

  return (
    <div className="max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Reviews</h1>
        <SearchBox initialValue={search} label="Search reviews" placeholder="Product, reviewer or words in the review" onSearch={(q) => filters.update({ q })} />
      </div>

      <div className="flex flex-wrap gap-3">
        <FilterChips label="Review status" options={statuses} value={status} onChange={(value) => filters.update({ status: value })} />
        <FilterChips label="Rating" options={ratings} value={rating} onChange={(value) => filters.update({ rating: value })} />
      </div>

      {error && <ErrorAlert>{getErrorMessage(error, 'Could not load reviews.')}</ErrorAlert>}

      <section className={`overflow-hidden rounded-xl border border-border bg-white ${isFetching && !isLoading ? 'opacity-60' : ''}`}>
        {isLoading ? (
          <div className="h-40 animate-pulse" aria-busy="true" aria-label="Loading reviews" />
        ) : !data || data.items.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted" aria-hidden />
            <p className="text-sm text-muted">No reviews found.</p>
          </div>
        ) : (
          <>
            <p className="border-b border-border px-4 py-2 text-xs text-muted">{data.totalCount} reviews</p>
            <ul className="divide-y divide-border">
              {data.items.map((review) => (
                <li key={review.id} className={`space-y-2 px-4 py-4 ${review.isHidden ? 'bg-surface' : ''}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link to={`/products/${review.productId}#reviews`} className="font-medium hover:text-primary">
                        {review.productName}
                      </Link>
                      <p className="text-xs text-muted">
                        <Link to={`/admin/customers/${review.customerId}`} className="hover:text-primary hover:underline">
                          {review.reviewerName}
                        </Link>{' '}
                        &middot; {formatDateTime(review.createdAt)}
                      </p>
                    </div>
                    <Stars value={review.rating} />
                  </div>
                  {review.title && <p className="font-semibold">{review.title}</p>}
                  {review.comment && <p className="whitespace-pre-line text-sm">{review.comment}</p>}
                  {review.isHidden && (
                    <p className="flex items-center gap-2 text-sm text-danger">
                      <EyeOff className="h-4 w-4 shrink-0" aria-hidden /> Hidden: {review.hiddenReason}
                    </p>
                  )}
                  <ReviewActions review={review} />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {data && <Pagination page={data.pageNumber} totalPages={data.totalPages} onChange={(next) => filters.update({ page: next === 1 ? undefined : String(next) })} />}
    </div>
  )
}