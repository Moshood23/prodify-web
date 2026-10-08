import { z } from 'zod'

// Limits match CreateVoucherCommandValidator / UpdateVoucherCommandValidator.
const amount = /^\d{1,12}(\.\d{1,2})?$/

export const voucherSchema = z
  .object({
    code: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9]{3,30}$/, 'Use 3 to 30 letters or numbers, e.g. WELCOME10.'),
    description: z.string().trim().min(1, 'Describe the voucher, e.g. "10% off your first order".').max(200, 'Keep it under 200 characters.'),
    discountType: z.enum(['Percent', 'Fixed']),
    value: z.string().trim().regex(amount, 'Enter a number, e.g. 10 or 2000.'),
    minOrderAmount: z.string().trim().regex(amount, 'Enter an amount in naira, or 0 for any order.'),
  })
  .superRefine((v, ctx) => {
    const value = Number(v.value)
    if (value <= 0) ctx.addIssue({ code: 'custom', path: ['value'], message: 'Must be more than 0.' })
    if (v.discountType === 'Percent' && value > 90) ctx.addIssue({ code: 'custom', path: ['value'], message: 'A percentage can be at most 90.' })
  })

export type VoucherValues = z.infer<typeof voucherSchema>
