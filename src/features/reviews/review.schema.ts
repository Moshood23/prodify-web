import { z } from 'zod'

// Limits match SubmitReviewCommandValidator.
export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Choose a star rating.').max(5, 'Choose a star rating.'),
  title: z.string().trim().max(120, 'Keep the title under 120 characters.'),
  comment: z.string().trim().max(2000, 'Keep your review under 2000 characters.'),
})

export type ReviewFormValues = z.infer<typeof reviewSchema>
