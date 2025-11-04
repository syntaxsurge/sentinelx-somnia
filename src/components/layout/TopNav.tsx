'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { ConnectButton } from '@rainbow-me/rainbowkit'

import SiweButton from '@/components/auth/SiweButton'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Overview' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/monitors/new', label: 'New Monitor' },
  { href: '/docs', label: 'Docs' },
  { href: '/settings', label: 'Settings' }
]

export function TopNav() {
  const pathname = usePathname()

  return (
    <header className='w-full border-b border-border bg-background/80 backdrop-blur'>
      <div className='mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
        <div className='flex items-center gap-6'>
          <Link href='/' className='text-lg font-semibold text-brand-teal'>
            SentinelX
          </Link>
          <nav className='hidden items-center gap-4 text-sm text-muted-foreground md:flex'>
            {links.map(link => {
              const active =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'transition-colors hover:text-brand-teal',
                    active && 'text-brand-teal'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className='flex items-center gap-2'>
          <SiweButton />
          <ConnectButton />
        </div>
      </div>
      <Separator className='md:hidden' />
      <nav className='flex items-center justify-between gap-2 px-4 pb-3 text-sm text-muted-foreground md:hidden'>
        {links.map(link => {
          const active =
            link.href === '/'
              ? pathname === '/'
              : pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex-1 rounded-md px-3 py-2 text-center transition-colors hover:text-brand-teal',
                active && 'bg-muted text-brand-teal'
              )}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
