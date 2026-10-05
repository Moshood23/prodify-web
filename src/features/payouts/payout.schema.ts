import { z } from 'zod'

// Limits match the API validators (SavePayoutAccountCommandValidator, ...).

export const payoutAccountSchema = z.object({
  bankName: z.string().trim().min(2, "Enter your bank's name.").max(100, 'Bank name is too long.'),
  accountNumber: z.string().trim().regex(/^\d{10}$/, 'Account number must be 10 digits.'),
  accountName: z.string().trim().min(2, 'Enter the name on the account.').max(100, 'Account name is too long.'),
})

export type PayoutAccountValues = z.infer<typeof payoutAccountSchema>

// Amounts are typed as text and checked against what's available on the page.
export const amountPattern = /^\d{1,12}(\.\d{1,2})?$/

export const commissionSchema = z.object({
  commissionRate: z
    .string()
    .trim()
    .regex(/^\d{1,2}(\.\d{1,2})?$/, 'Enter a percentage, e.g. 10 or 12.5.')
    .refine((v) => Number(v) <= 50, 'Commission must be 50% or less.'),
})

export type CommissionValues = z.infer<typeof commissionSchema>
