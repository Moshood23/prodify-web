import { z } from 'zod'

// Limits match the category and brand validators on the API.

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Enter a name.').max(200, 'Name is too long.'),
  description: z.string().trim().max(1000, 'Keep it under 1000 characters.'),
  parentCategoryId: z.string(),
})

export type CategoryFormValues = z.infer<typeof categorySchema>

export const brandSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name.').max(200, 'Name is too long.'),
  description: z.string().trim().max(1000, 'Keep it under 1000 characters.'),
  logoUrl: z
    .string()
    .trim()
    .max(500, 'Link is too long.')
    .refine((v) => v === '' || /^https?:\/\/\S+$/i.test(v), 'Enter a link starting with http:// or https://'),
})

export type BrandFormValues = z.infer<typeof brandSchema>