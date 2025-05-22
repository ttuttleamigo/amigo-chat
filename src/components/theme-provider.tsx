"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
// Removed direct import of ThemeProviderProps

export function ThemeProvider({ 
  children, 
  ...props 
}: React.ComponentProps<typeof NextThemesProvider>) { // Changed props typing
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
