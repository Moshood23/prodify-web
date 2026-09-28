// Rules for photo uploads; the API checks the same things.
export const MAX_IMAGES = 10
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const PHOTO_ACCEPT = PHOTO_TYPES.join(',')

export interface PhotoSelection {
  accepted: File[]
  problems: string[]
}

// Splits the chosen files into ones we can upload and reasons for the rest.
export function checkPhotoFiles(files: File[], slotsLeft: number): PhotoSelection {
  const accepted: File[] = []
  const problems: string[] = []

  for (const file of files) {
    if (!PHOTO_TYPES.includes(file.type)) problems.push(`${file.name} is not a JPG, PNG or WebP photo.`)
    else if (file.size > MAX_PHOTO_BYTES) problems.push(`${file.name} is larger than 5 MB.`)
    else accepted.push(file)
  }

  if (accepted.length > slotsLeft) {
    problems.push(
      slotsLeft === 0
        ? `This product already has ${MAX_IMAGES} photos. Remove one to add another.`
        : `Only ${slotsLeft} more photo${slotsLeft === 1 ? '' : 's'} can be added, so the rest were skipped.`,
    )
    accepted.length = slotsLeft
  }

  return { accepted, problems }
}

// Returns a copy of ids with the item at `from` moved to `to`.
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  const copy = [...items]
  const [item] = copy.splice(from, 1)
  copy.splice(to, 0, item)
  return copy
}