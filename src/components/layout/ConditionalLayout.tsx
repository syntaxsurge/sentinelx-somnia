'use client'

import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

import { ConnectButton } from '@rainbow-me/rainbowkit'

import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Homepage and onboarding should not have the sidebar
  const isStandalonePage = pathname === '/' || pathname === '/onboarding'

  if (isStandalonePage) {
    return (
      <div className='min-h-screen bg-background text-foreground'>
        <header className='sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80'>
          <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
            <Link href='/' className='flex items-center gap-3'>
              <Image
                src='/images/sentinelx-logo.png'
                alt='SentinelX logo'
                width={40}
                height={40}
                className='h-10 w-10'
                priority
              />
              <div className='flex flex-col'>
                <span className='text-base font-bold tracking-tight text-foreground'>
                  SentinelX
                </span>
                <span className='text-xs text-muted-foreground'>
                  Somnia Guardian
                </span>
              </div>
            </Link>

            <div className='flex items-center gap-4'>
              {pathname === '/' && (
                <Button asChild variant='ghost' size='sm'>
                  <Link href='/dashboard'>Dashboard</Link>
                </Button>
              )}
              <ConnectButton
                showBalance={false}
                accountStatus='address'
                chainStatus='icon'
              />
            </div>
          </div>
        </header>

        <main className='flex-1'>{children}</main>
      </div>
    )
  }

  return <AppShell>{children}</AppShell>
}
