'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { ThemeToggle } from '@/components/theme-toggle'

const navItems: Array<{
  href: string
  label: string
  external?: boolean
}> = [
  { href: '/', label: 'Overview' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/docs', label: 'Docs' },
  {
    href: 'https://github.com/sentinelx-labs/sentinelx-somnia-guardian',
    label: 'GitHub',
    external: true
  }
]

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className='sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur'>
      <div className='mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6'>
        <Link
          href='/'
          className='flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand-teal'
        >
          <span className='inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-teal/20 text-brand-teal'>
            SX
          </span>
          SentinelX
        </Link>

        <nav className='hidden items-center gap-1 text-sm font-medium md:flex'>
          {navItems.map(item => {
            const isActive =
              item.href === '/'
                ? pathname === item.href
                : pathname.startsWith(item.href)
            const baseStyles =
              'px-3 py-2 rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/60'

            if (item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target='_blank'
                  rel='noreferrer'
                  className={`${baseStyles} ${
                    isActive
                      ? 'bg-brand-teal/20 text-brand-teal'
                      : 'text-muted-foreground hover:text-brand-teal'
                  }`}
                >
                  {item.label}
                </a>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${baseStyles} ${
                  isActive
                    ? 'bg-brand-teal/20 text-brand-teal'
                    : 'text-muted-foreground hover:text-brand-teal'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className='flex items-center gap-3'>
          <ThemeToggle />
        </div>
      </div>
      <nav className='border-t border-white/5 bg-background/60 px-4 py-2 text-sm font-medium text-muted-foreground md:hidden'>
        <div className='mx-auto flex max-w-6xl items-center justify-between gap-2'>
          {navItems.map(item => {
            const isActive =
              item.href === '/'
                ? pathname === item.href
                : pathname.startsWith(item.href)
            const baseStyles =
              'flex-1 rounded-md px-3 py-2 text-center transition'

            if (item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target='_blank'
                  rel='noreferrer'
                  className={`${baseStyles} ${
                    isActive
                      ? 'bg-brand-teal/20 text-brand-teal'
                      : 'bg-muted/40 text-muted-foreground hover:text-brand-teal'
                  }`}
                >
                  {item.label}
                </a>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${baseStyles} ${
                  isActive
                    ? 'bg-brand-teal/20 text-brand-teal'
                    : 'bg-muted/40 text-muted-foreground hover:text-brand-teal'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
