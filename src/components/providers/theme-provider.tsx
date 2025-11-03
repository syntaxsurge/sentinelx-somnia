'use client'

import { type ReactNode } from 'react'

import { ThemeProvider as NextThemeProvider } from 'next-themes'

type ThemeProviderProps = {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemeProvider
      attribute='class'
      defaultTheme='dark'
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  )
}
