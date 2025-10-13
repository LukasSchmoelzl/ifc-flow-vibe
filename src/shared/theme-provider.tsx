'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      themes={["light", "dark", "tokyo-night-dark", "tokyo-night-light"]}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
