import type { Metadata } from 'next'
import NextTopLoader from 'nextjs-toploader'

import { EnsureTenantOnMount } from '@/components/auth/EnsureTenantOnMount'
import { TopNav } from '@/components/layout/TopNav'
import { ClientProviders } from '@/components/providers/ClientProviders'
import { ConvexProviderClient } from '@/components/providers/ConvexProvider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { SiteFooter } from '@/components/site-footer'
import { Toaster } from '@/components/ui/toaster'

import './globals.css'

export const metadata: Metadata = {
  title: 'SentinelX',
  description:
    'SentinelX monitors Somnia oracles in real-time, hardens prices, and safeguards smart contracts with autonomous circuit breakers.'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className='min-h-screen bg-background text-foreground antialiased'>
        <ThemeProvider>
          <ConvexProviderClient>
            <ClientProviders>
              <NextTopLoader showSpinner={false} color='#2dd4bf' />
              <EnsureTenantOnMount />
              <TopNav />
              <main className='relative flex min-h-[calc(100vh-6rem)] flex-col bg-gradient-to-b from-background via-background to-accent-darker/20 pb-16 pt-12 sm:pt-16'>
                <div className='mx-auto w-full max-w-6xl px-4 sm:px-6'>
                  {children}
                </div>
              </main>
              <SiteFooter />
              <Toaster />
            </ClientProviders>
          </ConvexProviderClient>
        </ThemeProvider>
      </body>
    </html>
  )
}
