import type { Metadata } from 'next'
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
      <body className='min-h-screen bg-slate-950 text-slate-50 antialiased'>
        {children}
      </body>
    </html>
  )
}
