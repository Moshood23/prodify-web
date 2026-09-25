import { z } from 'zod'
import { nigerianStates } from '../../checkout/validation/nigerianStates'

const phoneNumber = z
  .string()
  .trim()
  .min(1, 'Enter a phone number customers and riders can reach.')
  .max(20, 'Phone number is too long.')
  .regex(/^\+?[0-9 ()-]{7,20}$/, 'Enter a valid phone number, e.g. 0803 123 4567.')

const businessName = z.string().trim().min(2, 'Enter your business name.').max(200, 'Business name is too long.')
const description = z.string().trim().max(1000, 'Keep the description under 1000 characters.')

// Lengths match RegisterSellerCommandValidator on the API.
export const sellerApplicationSchema = z.object({
  businessName,
  email: z.string().trim().min(1, 'Enter a business email.').email('Enter a valid email address.').max(256),
  phoneNumber,
  description,
  addressLine1: z.string().trim().min(1, 'Enter the address orders are picked up from.').max(300, 'Address is too long.'),
  addressLine2: z.string().trim().max(300, 'Too long.'),
  city: z.string().trim().min(1, 'Enter the city or town.').max(100, 'City is too long.'),
  state: z.string().refine((value) => (nigerianStates as readonly string[]).includes(value), 'Choose a state.'),
  acceptTerms: z.boolean().refine((value) => value, 'You must accept the seller terms to apply.'),
})

export type SellerApplicationFormValues = z.infer<typeof sellerApplicationSchema>

export const reapplySchema = z.object({ businessName, phoneNumber, description })

export type ReapplyFormValues = z.infer<typeof reapplySchema>