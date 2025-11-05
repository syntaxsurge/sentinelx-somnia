'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Overview' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/monitors', label: 'Monitors' },
  { href: '/settings', label: 'Settings' },
  { href: '/docs', label: 'Docs' }
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className='min-h-dvh bg-gradient-to-b from-background via-background to-muted/30'>
      <header className='sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur'>
        <div className='mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6'>
          <div className='flex items-center gap-4'>
            <Link href='/' className='text-base font-semibold tracking-tight'>
              SentinelX
            </Link>

            <nav className='hidden items-center gap-2 text-sm text-muted-foreground md:flex'>
              {navItems.map(item => {
                const active =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'rounded-md px-3 py-2 transition-colors hover:text-foreground',
                      active && 'bg-secondary/80 text-foreground'
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className='flex items-center gap-2'>
            <div className='md:hidden'>
              <ConnectButton
                showBalance={false}
                accountStatus='avatar'
                chainStatus='icon'
              />
            </div>
            <div className='hidden md:block'>
              <ConnectButton
                showBalance={false}
                accountStatus='address'
                chainStatus='icon'
              />
            </div>
            <Sheet>
              <SheetTrigger asChild className='md:hidden'>
                <Button
                  variant='outline'
                  size='icon'
                  aria-label='Toggle navigation'
                >
                  <Menu className='h-5 w-5' />
                </Button>
              </SheetTrigger>
              <SheetContent side='left' className='w-80'>
                <SheetHeader className='mb-6'>
                  <SheetTitle>SentinelX</SheetTitle>
                </SheetHeader>
                <nav className='flex flex-col gap-1 text-sm'>
                  {navItems.map(item => {
                    const active =
                      item.href === '/'
                        ? pathname === '/'
                        : pathname.startsWith(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'rounded-md px-3 py-2 font-medium transition-colors hover:bg-accent',
                          active && 'bg-accent text-accent-foreground'
                        )}
                      >
                        {item.label}
                      </Link>
                    )
                  })}
                </nav>
                <Separator className='my-4' />
                <ConnectButton
                  showBalance={false}
                  accountStatus='address'
                  chainStatus='icon'
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className='flex-1'>
        <div className='mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12'>
          {children}
        </div>
      </main>
    </div>
  )
}
