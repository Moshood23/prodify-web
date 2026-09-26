import { z } from 'zod'
import { passwordRules } from '../../auth/validation/auth.schema'

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, 'Enter your first name.').max(100, 'First name is too long.'),
  lastName: z.string().trim().min(1, 'Enter your last name.').max(100, 'Last name is too long.'),
  phoneNumber: z
    .string()
    .trim()
    .max(20, 'Phone number is too long.')
    .refine((value) => value === '' || /^\+?[0-9 ()-]{7,20}$/.test(value), 'Enter a valid phone number, e.g. 0803 123 4567.'),
})

export type ProfileFormValues = z.infer<typeof profileSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.'),
    newPassword: z
      .string()
      .min(1, 'Enter a new password.')
      .refine((value) => passwordRules.every((rule) => rule.test(value)), 'Password does not meet all the requirements.'),
    confirmPassword: z.string().min(1, 'Confirm your new password.'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: 'Your new password must be different from your current password.',
    path: ['newPassword'],
  })

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>