import type { Metadata } from 'next'
import NextTopLoader from 'nextjs-toploader'

import { ThemeProvider } from '@/components/providers/theme-provider'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

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
          <NextTopLoader showSpinner={false} color='#2dd4bf' />
          <SiteHeader />
          <main className='relative flex min-h-[calc(100vh-8rem)] flex-col bg-gradient-to-b from-background via-background to-accent-darker/20 pb-16 pt-12 sm:pt-16'>
            {children}
          </main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  )
}
