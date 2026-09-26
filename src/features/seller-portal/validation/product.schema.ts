import { z } from 'zod'

// Limits match the API validators (CreateProductCommandValidator, VariantRules, ...).
// Number fields are kept as text while typing and converted when the form is sent.

export const productSchema = z.object({
  name: z.string().trim().min(2, 'Enter the product name.').max(200, 'Product name is too long.'),
  description: z.string().trim().max(4000, 'Keep the description under 4000 characters.'),
  categoryId: z.string().min(1, 'Choose a category.'),
  brandId: z.string(),
})

export type ProductFormValues = z.infer<typeof productSchema>

const money = /^\d{1,9}(\.\d{1,2})?$/
const wholeNumber = /^\d{1,6}$/

export const MAX_STOCK = 100_000

const variantFields = {
  name: z.string().trim().max(200, 'Option name is too long.'),
  price: z
    .string()
    .trim()
    .min(1, 'Enter a price.')
    .refine((v) => money.test(v) && Number(v) > 0, 'Enter a price in naira, e.g. 25000.'),
  compareAtPrice: z
    .string()
    .trim()
    .refine((v) => v === '' || money.test(v), 'Enter an amount in naira, or leave it empty.'),
  weight: z
    .string()
    .trim()
    .refine((v) => v === '' || (/^\d{1,4}(\.\d{1,3})?$/.test(v) && Number(v) <= 1000), 'Enter the weight in kg, e.g. 0.5.'),
}

// An old price only makes sense when it is higher than the selling price.
function checkCompareAtPrice(values: { price: string; compareAtPrice: string }, ctx: z.RefinementCtx) {
  if (values.compareAtPrice !== '' && money.test(values.price) && Number(values.compareAtPrice) <= Number(values.price)) {
    ctx.addIssue({ code: 'custom', path: ['compareAtPrice'], message: 'The old price must be higher than the selling price.' })
  }
}

export const variantSchema = z.object(variantFields).superRefine(checkCompareAtPrice)

export type VariantFormValues = z.infer<typeof variantSchema>

export const newVariantSchema = z
  .object({
    ...variantFields,
    sku: z
      .string()
      .trim()
      .min(1, 'Enter a SKU (your own code for this item).')
      .max(64, 'SKU is too long.')
      .regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/, 'Use only letters, numbers, dashes and underscores.'),
    initialStock: z
      .string()
      .trim()
      .refine((v) => wholeNumber.test(v) && Number(v) <= MAX_STOCK, `Enter a whole number from 0 to ${MAX_STOCK.toLocaleString()}.`),
  })
  .superRefine(checkCompareAtPrice)

export type NewVariantFormValues = z.infer<typeof newVariantSchema>

export const stockSchema = z
  .string()
  .trim()
  .refine((v) => wholeNumber.test(v) && Number(v) <= MAX_STOCK, `Enter 0 to ${MAX_STOCK.toLocaleString()}.`)

export const imageSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, 'Paste the link to the photo.')
    .max(1000, 'Link is too long.')
    .refine((v) => /^https?:\/\/\S+$/i.test(v), 'Enter a link starting with http:// or https://'),
  altText: z.string().trim().max(250, 'Keep the description under 250 characters.'),
})

export type ImageFormValues = z.infer<typeof imageSchema>

export const attributesSchema = z
  .object({
    attributes: z
      .array(
        z.object({
          name: z.string().trim().min(1, 'Enter a name, e.g. Colour.').max(100, 'Too long.'),
          value: z.string().trim().min(1, 'Enter a value.').max(500, 'Too long.'),
        }),
      )
      .max(30, 'A product can have at most 30 specifications.'),
  })
  .superRefine((values, ctx) => {
    const seen = new Set<string>()
    values.attributes.forEach((attribute, index) => {
      const key = attribute.name.trim().toLowerCase()
      if (key && seen.has(key)) {
        ctx.addIssue({ code: 'custom', path: ['attributes', index, 'name'], message: 'This name is already used above.' })
      }
      seen.add(key)
    })
  })

export type AttributesFormValues = z.infer<typeof attributesSchema>

// Form text -> API numbers.
export function toVariantInput(values: VariantFormValues) {
  return {
    name: values.name || undefined,
    price: Number(values.price),
    compareAtPrice: values.compareAtPrice === '' ? undefined : Number(values.compareAtPrice),
    weight: values.weight === '' ? 0 : Number(values.weight),
  }
}