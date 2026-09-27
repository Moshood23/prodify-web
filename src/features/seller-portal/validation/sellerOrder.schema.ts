import { z } from 'zod'

// Limits match ChangeSellerOrderStatusCommandValidator on the API.

export const shipSchema = z.object({
  carrier: z.string().trim().min(1, 'Enter who is delivering the package.').max(100, 'Too long.'),
  trackingNumber: z.string().trim().max(100, 'Too long.'),
})

export type ShipFormValues = z.infer<typeof shipSchema>

export const cancelSchema = z.object({
  reason: z.string().trim().min(3, 'Tell the customer why the order is cancelled.').max(500, 'Keep it under 500 characters.'),
})

export type CancelFormValues = z.infer<typeof cancelSchema>