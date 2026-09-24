import { z } from 'zod'

// Must match ASP.NET Identity's password options on the API
// (RequiredLength = 8, plus the default digit / lowercase / uppercase / symbol rules).
export const passwordRules = [
  { label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
  { label: 'An uppercase letter', test: (value: string) => /[A-Z]/.test(value) },
  { label: 'A lowercase letter', test: (value: string) => /[a-z]/.test(value) },
  { label: 'A number', test: (value: string) => /\d/.test(value) },
  { label: 'A symbol (e.g. @ # ! $)', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
]

const password = z
  .string()
  .min(1, 'Enter a password.')
  .refine((value) => passwordRules.every((rule) => rule.test(value)), 'Password does not meet all the requirements.')

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Enter your email.').email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'Enter your first name.').max(100, 'First name is too long.'),
    lastName: z.string().trim().min(1, 'Enter your last name.').max(100, 'Last name is too long.'),
    email: z.string().trim().min(1, 'Enter your email.').email('Enter a valid email address.').max(256),
    phoneNumber: z
      .string()
      .trim()
      .max(20, 'Phone number is too long.')
      .refine((value) => value === '' || /^\+?[0-9 ()-]{7,20}$/.test(value), 'Enter a valid phone number, e.g. 0803 123 4567.'),
    password,
    confirmPassword: z.string().min(1, 'Confirm your password.'),
    acceptTerms: z.boolean().refine((value) => value, 'You must accept the terms to create an account.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>