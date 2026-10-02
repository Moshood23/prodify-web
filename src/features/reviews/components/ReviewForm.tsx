import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSubmitReview } from '../hooks'
import { reviewSchema, type ReviewFormValues } from '../review.schema'
import { StarPicker } from './StarPicker'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'
import { TextArea } from '../../../components/ui/TextArea'
import { ErrorAlert } from '../../../components/ui/Alert'
import { useToastStore } from '../../../store/toastStore'
import { applyServerFieldErrors, getErrorMessage } from '../../../services/api/apiError'
import type { Review } from '../../../types/catalog'

interface ReviewFormProps {
  productId: string
  existing: Review | null
  onDone: () => void
}

export function ReviewForm({ productId, existing, onDone }: ReviewFormProps) {
  const showToast = useToastStore((s) => s.show)
  const submit = useSubmitReview(productId)
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: existing?.rating ?? 0, title: existing?.title ?? '', comment: existing?.comment ?? '' },
  })

  function send(values: ReviewFormValues) {
    submit.mutate(
      { rating: values.rating, title: values.title || undefined, comment: values.comment || undefined },
      {
        onSuccess: () => {
          showToast({ kind: 'success', message: existing ? 'Review updated' : 'Thanks for your review' })
          onDone()
        },
        onError: (e) => applyServerFieldErrors(e, ['rating', 'title', 'comment'] as const, setError),
      },
    )
  }

  const hasFieldError = errors.rating || errors.title || errors.comment

  return (
    <form onSubmit={handleSubmit(send)} noValidate className="space-y-4 rounded-lg border border-primary bg-primary-light/40 p-4">
      <h3 className="font-bold">{existing ? 'Edit your review' : 'Write a review'}</h3>
      {submit.error && !hasFieldError && <ErrorAlert>{getErrorMessage(submit.error, 'Could not save your review.')}</ErrorAlert>}
      <Controller
        control={control}
        name="rating"
        render={({ field }) => <StarPicker value={field.value} onChange={field.onChange} error={errors.rating?.message} />}
      />
      <TextField label="Title (optional)" placeholder="e.g. Great value for money" maxLength={120} error={errors.title?.message} {...register('title')} />
      <TextArea
        label="Your review (optional)"
        placeholder="What did you like or not like? How are you using it?"
        maxLength={2000}
        error={errors.comment?.message}
        {...register('comment')}
      />
      <div className="flex flex-wrap gap-3">
        <Button type="submit" isLoading={submit.isPending}>
          {existing ? 'Save changes' : 'Post review'}
        </Button>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
