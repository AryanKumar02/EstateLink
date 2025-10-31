import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark'

interface ThemeState {
  mode: ThemeMode
}

interface ThemeActions {
  toggleTheme: () => void
  setTheme: (mode: ThemeMode) => void
}

type ThemeStore = ThemeState & ThemeActions

const THEME_STORAGE_KEY = 'homeiq-theme-mode'

// Get initial theme from localStorage or system preference
const getInitialTheme = (): ThemeMode => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }

  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: getInitialTheme(),

  toggleTheme: () => set((state) => {
    const newMode = state.mode === 'light' ? 'dark' : 'light'
    localStorage.setItem(THEME_STORAGE_KEY, newMode)
    return { mode: newMode }
  }),

  setTheme: (mode: ThemeMode) => {
    localStorage.setItem(THEME_STORAGE_KEY, mode)
    set({ mode })
  },
}))

// Selectors for optimized re-renders
export const useThemeMode = () => useThemeStore((state) => state.mode)
export const useToggleTheme = () => useThemeStore((state) => state.toggleTheme)
export const useSetTheme = () => useThemeStore((state) => state.setTheme)
