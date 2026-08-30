import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import { DARK, LIGHT, type Palette } from './tokens'
import { useApp } from '@/store/AppContext'

type ThemeValue = { c: Palette; scheme: 'light' | 'dark'; isDark: boolean }

const ThemeCtx = createContext<ThemeValue>({ c: LIGHT, scheme: 'light', isDark: false })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme()
  const { state } = useApp()
  const scheme: 'light' | 'dark' =
    state.theme === 'system' ? (system === 'dark' ? 'dark' : 'light') : state.theme

  const value = useMemo<ThemeValue>(
    () => ({ c: scheme === 'dark' ? DARK : LIGHT, scheme, isDark: scheme === 'dark' }),
    [scheme],
  )
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}

export function useTheme(): ThemeValue {
  return useContext(ThemeCtx)
}
