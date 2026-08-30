// src/types/next-themes.d.ts
declare module 'next-themes' {
  import { ReactNode } from 'react'

  export interface ThemeProviderProps {
    children: ReactNode
    defaultTheme?: string
    attribute?: string
    value?: { [themeName: string]: string }
    storageKey?: string
    enableSystem?: boolean
    forcedTheme?: string
    enableColorScheme?: boolean
    disableTransitionOnChange?: boolean
  }

  export function ThemeProvider(props: ThemeProviderProps): JSX.Element

  export function useTheme(): {
    theme: string | undefined
    setTheme: (theme: string) => void
    resolvedTheme: string | undefined
    themes: string[]
    systemTheme: string | undefined
  }
}
