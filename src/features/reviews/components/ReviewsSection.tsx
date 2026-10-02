import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { BadgeCheck, EyeOff, MessageSquare, Pencil } from 'lucide-react'
import { useProductReviews } from '../hooks'
import { ReviewForm } from './ReviewForm'
import { Stars } from '../../catalog/components/Stars'
import { Button } from '../../../components/ui/Button'
import { ErrorAlert } from '../../../components/ui/Alert'
import { useAuthStore } from '../../../store/authStore'
import { formatDate } from '../../../lib/format'
import { getErrorMessage } from '../../../services/api/apiError'
import type { ProductReviews, Review } from '../../../types/catalog'

const PAGE_SIZE = 5
// The API sends at most 50 reviews at a time.
const MAX_PAGE_SIZE = 50

function Summary({ data }: { data: ProductReviews }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-4xl font-bold">{data.averageRating?.toFixed(1) ?? '-'}</span>
        <div>
          <Stars value={data.averageRating ?? 0} size="lg" />
          <p className="text-sm text-muted">
            {data.reviewCount} {data.reviewCount === 1 ? 'review' : 'reviews'}
          </p>
        </div>
      </div>
      <ul className="space-y-1.5">
        {data.breakdown.map((row) => {
          const percent = data.reviewCount === 0 ? 0 : Math.round((row.count / data.reviewCount) * 100)
          return (
            <li key={row.stars} className="flex items-center gap-2 text-sm">
              <span className="w-12 shrink-0 text-muted">{row.stars} star</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
                <span className="block h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
              </span>
              <span className="w-8 shrink-0 text-right text-muted">{row.count}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function ReviewItem({ review, mine = false }: { review: Review; mine?: boolean }) {
  return (
    <article className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <Stars value={review.rating} size="sm" />
        {review.title && <h3 className="font-semibold">{review.title}</h3>}
      </div>
      {review.comment && <p className="whitespace-pre-line text-sm leading-relaxed">{review.comment}</p>}
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
        <span>
          {mine ? 'You' : review.reviewerName}, {formatDate(review.createdAt)}
          {review.editedAt && ' (edited)'}
        </span>
        <span className="flex items-center gap-1 font-medium text-success">
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> Verified purchase
        </span>
      </p>
    </article>
  )
}

function WriteReview({ productId, data }: { productId: string; data: ProductReviews }) {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isCustomer = useAuthStore((s) => s.hasRole('Customer'))
  // "?review=1" comes from the "Write a review" link on an order.
  const [open, setOpen] = useState(searchParams.get('review') === '1')

  if (!isAuthenticated) {
    const returnTo = encodeURIComponent(location.pathname + location.search + '#reviews')
    return (
      <p className="text-sm text-muted">
        <Link to={`/login?returnTo=${returnTo}`} className="font-semibold text-primary hover:underline">
          Log in
        </Link>{' '}
        to write a review.
      </p>
    )
  }

  if (!isCustomer) return null

  const mine = data.myReview

  if (open && (mine || data.canReview)) return <ReviewForm productId={productId} existing={mine} onDone={() => setOpen(false)} />

  if (mine) {
    return (
      <div className="space-y-3 rounded-lg border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold">Your review</p>
          <Button variant="outline" className="py-1.5" onClick={() => setOpen(true)}>
            <Pencil className="h-4 w-4" aria-hidden /> Edit
          </Button>
        </div>
        {mine.isHidden && (
          <p className="flex items-center gap-2 rounded-md bg-accent-light px-3 py-2 text-sm text-accent-dark">
            <EyeOff className="h-4 w-4 shrink-0" aria-hidden /> Our team has hidden this review, so other shoppers can't see it.
          </p>
        )}
        <ReviewItem review={mine} mine />
      </div>
    )
  }

  if (!data.canReview) return <p className="text-sm text-muted">Only customers who have received this product can review it.</p>

  return (
    <Button onClick={() => setOpen(true)}>
      <Pencil className="h-4 w-4" aria-hidden /> Write a review
    </Button>
  )
}

export function ReviewsSection({ productId }: { productId: string }) {
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const { data, isLoading, isFetching, error } = useProductReviews(productId, pageSize)
  const location = useLocation()
  const sectionRef = useRef<HTMLElement>(null)

  // The browser can't jump to #reviews before the section exists, so scroll once it has loaded.
  const loaded = !!data
  useEffect(() => {
    if (loaded && location.hash === '#reviews') sectionRef.current?.scrollIntoView({ block: 'start' })
  }, [loaded, location.hash])

  // The customer's own review is shown with the form, so leave it out of the list.
  const others = data?.reviews.items.filter((r) => r.id !== data.myReview?.id) ?? []
  const hasMore = !!data && pageSize < MAX_PAGE_SIZE && data.reviews.pageNumber < data.reviews.totalPages

  return (
    <section id="reviews" ref={sectionRef} className="scroll-mt-20 rounded-xl border border-border bg-white p-4 sm:p-6">
      <h2 className="mb-4 text-lg font-bold">Ratings and reviews</h2>

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-lg bg-surface" aria-busy="true" aria-label="Loading reviews" />
      ) : error || !data ? (
        <ErrorAlert>{getErrorMessage(error, 'Could not load reviews.')}</ErrorAlert>
      ) : (
        <div className="grid gap-8 md:grid-cols-[minmax(0,18rem)_1fr]">
          <div className="space-y-5">
            {data.reviewCount > 0 ? (
              <Summary data={data} />
            ) : (
              <div className="text-center md:text-left">
                <MessageSquare className="mx-auto mb-2 h-8 w-8 text-muted md:mx-0" aria-hidden />
                <p className="text-sm text-muted">No reviews yet.</p>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <WriteReview productId={productId} data={data} />

            {others.length > 0 && (
              <ul className="divide-y divide-border">
                {others.map((review) => (
                  <li key={review.id} className="py-4 first:pt-0">
                    <ReviewItem review={review} />
                  </li>
                ))}
              </ul>
            )}

            {hasMore && (
              <Button variant="outline" isLoading={isFetching} onClick={() => setPageSize((size) => Math.min(MAX_PAGE_SIZE, size + PAGE_SIZE * 2))}>
                Show more reviews
              </Button>
            )}
          </div>
        </div>
      )}
    </section>
  )
}