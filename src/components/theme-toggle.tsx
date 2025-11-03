'use client'

import { useEffect, useState } from 'react'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const toggle = () => {
    if (!mounted) return
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      type='button'
      onClick={toggle}
      aria-label='Toggle theme'
      className='inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow transition hover:border-brand-teal hover:text-brand-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/70'
    >
      {mounted && resolvedTheme === 'light' ? (
        <Sun className='h-4 w-4' />
      ) : (
        <Moon className='h-4 w-4' />
      )}
    </button>
  )
}
