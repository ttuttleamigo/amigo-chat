"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <Button
      variant="ghost" // Use ghost variant for a plain icon button
      size="icon"     // Keep size="icon" for appropriate icon sizing
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="text-card-foreground dark:text-white hover:bg-black/10 dark:hover:bg-white/20 rounded-full w-7 h-7 flex items-center justify-center" // Theme-aware icon color
    >
      <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
