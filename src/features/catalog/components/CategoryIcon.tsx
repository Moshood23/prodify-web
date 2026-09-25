import { Gamepad2, Laptop, Shirt, ShoppingBasket, Smartphone, Sofa, Sparkles, Tag, Tv, type LucideIcon } from 'lucide-react'

// Picks an icon from words in the category name; anything unknown gets a tag.
const iconRules: [RegExp, LucideIcon][] = [
  [/phone|tablet/i, Smartphone],
  [/comput|laptop/i, Laptop],
  [/electronic|tv/i, Tv],
  [/fashion|cloth/i, Shirt],
  [/home|kitchen|office/i, Sofa],
  [/health|beauty/i, Sparkles],
  [/supermarket|grocer/i, ShoppingBasket],
  [/gaming|game/i, Gamepad2],
]

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconRules.find(([pattern]) => pattern.test(name))?.[1] ?? Tag
  return <Icon className={className} aria-hidden />
}