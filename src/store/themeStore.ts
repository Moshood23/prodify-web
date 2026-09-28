import { create } from 'zustand'

// "system" follows the phone or computer setting.
export type ThemeChoice = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'prodify-theme'
const media = window.matchMedia('(prefers-color-scheme: dark)')

function readChoice(): ThemeChoice {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'light' || saved === 'dark' ? saved : 'system'
  } catch {
    return 'system'
  }
}

function apply(choice: ThemeChoice) {
  const dark = choice === 'dark' || (choice === 'system' && media.matches)
  document.documentElement.classList.toggle('dark', dark)
  // Colours the browser bar on phones.
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0b1220' : '#0e7c66')
}

interface ThemeState {
  choice: ThemeChoice
  setChoice: (choice: ThemeChoice) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  choice: readChoice(),
  setChoice(choice) {
    try {
      if (choice === 'system') localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, choice)
    } catch {
      // Private browsing: the choice just isn't remembered.
    }
    apply(choice)
    set({ choice })
  },
}))

// Apply on start, and follow the device when it switches between light and dark.
apply(useThemeStore.getState().choice)
media.addEventListener('change', () => {
  if (useThemeStore.getState().choice === 'system') apply('system')
})
