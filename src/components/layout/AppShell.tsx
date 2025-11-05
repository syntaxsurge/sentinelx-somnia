'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import {
  Menu,
  LayoutDashboard,
  Activity,
  AlertTriangle,
  ShieldCheck,
  Settings,
  BookOpen
} from 'lucide-react'

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
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/monitors', label: 'Monitors', icon: Activity },
  { href: '/incidents', label: 'Incidents', icon: AlertTriangle },
  { href: '/actions', label: 'Actions', icon: ShieldCheck },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/docs', label: 'Docs', icon: BookOpen }
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className='flex min-h-screen bg-background text-foreground'>
      <SidebarNav />

      <div className='flex min-h-screen flex-1 flex-col'>
        <header className='sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80'>
          <div className='flex h-16 items-center justify-between px-4 sm:px-6'>
            <div className='flex items-center gap-3 lg:hidden'>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant='outline' size='icon' aria-label='Open menu'>
                    <Menu className='h-5 w-5' />
                  </Button>
                </SheetTrigger>
                <SheetContent side='left' className='w-80'>
                  <SheetHeader className='mb-6 text-left'>
                    <Link href='/' className='flex items-center gap-3'>
                      <Image
                        src='/images/sentinelx-logo.png'
                        alt='SentinelX logo'
                        width={36}
                        height={36}
                        className='h-9 w-9'
                      />
                      <div className='flex flex-col'>
                        <SheetTitle className='text-base font-bold'>
                          SentinelX
                        </SheetTitle>
                        <span className='text-xs text-muted-foreground'>
                          Somnia Guardian
                        </span>
                      </div>
                    </Link>
                  </SheetHeader>
                  <nav className='flex flex-col gap-1'>
                    {mobileNav.map(item => {
                      const active = pathname.startsWith(item.href)
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                            active
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          <Icon className='h-5 w-5' />
                          {item.label}
                        </Link>
                      )
                    })}
                  </nav>
                </SheetContent>
              </Sheet>
              <Link
                href='/'
                className='flex items-center gap-2 text-sm font-bold'
              >
                <Image
                  src='/images/sentinelx-logo.png'
                  alt='SentinelX logo'
                  width={32}
                  height={32}
                  className='h-8 w-8'
                  priority
                />
                <span>SentinelX</span>
              </Link>
            </div>

            <div className='hidden lg:flex'>
              <span className='rounded-full bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-semibold text-primary'>
                Somnia AI Operations
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
          <div className='mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10'>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
