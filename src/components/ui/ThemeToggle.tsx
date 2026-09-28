import { Monitor, Moon, Sun } from 'lucide-react'
import { useThemeStore, type ThemeChoice } from '../../store/themeStore'

const next: Record<ThemeChoice, ThemeChoice> = { light: 'dark', dark: 'system', system: 'light' }

const labels: Record<ThemeChoice, string> = {
  light: 'Light mode',
  dark: 'Dark mode',
  system: 'Same as device',
}

const icons = { light: Sun, dark: Moon, system: Monitor }

// One button that cycles Light → Dark → Same as device.
export function ThemeToggle({ className = '' }: { className?: string }) {
  const choice = useThemeStore((s) => s.choice)
  const setChoice = useThemeStore((s) => s.setChoice)
  const Icon = icons[choice]

  return (
    <button
      type="button"
      onClick={() => setChoice(next[choice])}
      title={`${labels[choice]} (click to change)`}
      aria-label={`Theme: ${labels[choice]}. Change theme`}
      className={`flex items-center rounded-full p-1.5 ${className}`}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  )
}