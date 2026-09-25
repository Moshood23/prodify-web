import { z } from 'zod'
import { nigerianStates } from './nigerianStates'

// Lengths match AddCustomerAddressCommandValidator on the API.
export const addressSchema = z.object({
  label: z.string().trim().min(1, 'Give this address a name, e.g. Home.').max(100, 'Name is too long.'),
  recipientName: z.string().trim().min(1, 'Enter the name of the person receiving the order.').max(200, 'Name is too long.'),
  phoneNumber: z
    .string()
    .trim()
    .min(1, 'Enter a phone number for the delivery rider.')
    .max(20, 'Phone number is too long.')
    .regex(/^\+?[0-9 ()-]{7,20}$/, 'Enter a valid phone number, e.g. 0803 123 4567.'),
  addressLine1: z.string().trim().min(1, 'Enter the street address.').max(300, 'Address is too long.'),
  addressLine2: z.string().trim().max(300, 'Too long.'),
  city: z.string().trim().min(1, 'Enter the city or town.').max(100, 'City is too long.'),
  state: z.string().refine((value) => (nigerianStates as readonly string[]).includes(value), 'Choose a state.'),
  setAsDefault: z.boolean(),
})

export type AddressFormValues = z.infer<typeof addressSchema>