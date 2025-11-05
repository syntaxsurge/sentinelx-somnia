'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Menu } from 'lucide-react'

import { SidebarNav } from '@/components/layout/SidebarNav'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const mobileNav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/monitors', label: 'Monitors' },
  { href: '/incidents', label: 'Incidents' },
  { href: '/actions', label: 'Actions' },
  { href: '/settings', label: 'Settings' },
  { href: '/docs', label: 'Docs' }
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className='flex min-h-screen bg-background text-foreground'>
      <SidebarNav />

      <div className='flex min-h-screen flex-1 flex-col'>
        <header className='sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur'>
          <div className='flex h-14 items-center justify-between px-4 sm:px-6'>
            <div className='flex items-center gap-2 lg:hidden'>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant='outline' size='icon' aria-label='Open menu'>
                    <Menu className='h-5 w-5' />
                  </Button>
                </SheetTrigger>
                <SheetContent side='left' className='w-80'>
                  <SheetHeader className='mb-6 text-left'>
                    <SheetTitle>SentinelX</SheetTitle>
                  </SheetHeader>
                  <nav className='flex flex-col gap-1 text-sm'>
                    {mobileNav.map(item => {
                      const active = pathname.startsWith(item.href)
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            'rounded-md px-3 py-2 font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                            active && 'bg-accent text-accent-foreground'
                          )}
                        >
                          {item.label}
                        </Link>
                      )
                    })}
                  </nav>
                </SheetContent>
              </Sheet>
              <Link href='/dashboard' className='text-sm font-semibold'>
                SentinelX
              </Link>
            </div>

            <div className='hidden items-center gap-2 lg:flex'>
              <span className='text-base font-semibold tracking-tight'>
                SentinelX
              </span>
              <span className='rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400'>
                Somnia AI Ops
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <ConnectButton
                showBalance={false}
                accountStatus='address'
                chainStatus='icon'
              />
            </div>
          </div>
        </header>

        <main className='flex-1'>
          <div className='mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10'>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
