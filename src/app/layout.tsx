import type { Metadata } from 'next'
import NextTopLoader from 'nextjs-toploader'

import { EnsureTenantOnMount } from '@/components/auth/EnsureTenantOnMount'
import { ConditionalLayout } from '@/components/layout/ConditionalLayout'
import {
  DocsCopilotProvider,
  DocsCopilotWidget
} from '@/components/docs/docs-copilot-widget'
import { ClientProviders } from '@/components/providers/ClientProviders'
import { ConvexProviderClient } from '@/components/providers/ConvexProvider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { SiteFooter } from '@/components/site-footer'
import { Toaster } from '@/components/ui/toaster'

import './globals.css'

export const metadata: Metadata = {
  title: 'SentinelX',
  description:
    'SentinelX monitors Somnia oracles in real-time, hardens prices, and safeguards smart contracts with autonomous circuit breakers.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico'
  }
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
              <DocsCopilotProvider>
                <NextTopLoader showSpinner={false} color='#2dd4bf' />
                <EnsureTenantOnMount />
                <ConditionalLayout>{children}</ConditionalLayout>
                <SiteFooter />
                <DocsCopilotWidget />
                <Toaster />
              </DocsCopilotProvider>
            </ClientProviders>
          </ConvexProviderClient>
        </ThemeProvider>
      </body>
    </html>
  )
}
