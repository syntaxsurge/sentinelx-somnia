'use client'

import { useMemo } from 'react'

import {
  RainbowKitAuthenticationProvider,
  RainbowKitProvider,
  createAuthenticationAdapter,
  getDefaultConfig
} from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SiweMessage } from 'siwe'
import { WagmiProvider } from 'wagmi'

import { useAuthStatus } from '@/hooks/useSession'
import { somniaShannon } from '@/lib/chain'

if (typeof window === 'undefined') {
  import('fake-indexeddb/auto').catch(() => {
    // no-op; wagmi storage falls back when IndexedDB is unavailable
  })
}

const queryClient = new QueryClient()

const walletConnectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_ID &&
  process.env.NEXT_PUBLIC_WALLETCONNECT_ID.length > 0
    ? process.env.NEXT_PUBLIC_WALLETCONNECT_ID
    : 'sentinelx-demo'

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_ID) {
  console.warn(
    'NEXT_PUBLIC_WALLETCONNECT_ID is not set. Using a demo projectId; obtain a WalletConnect Cloud ID for production.'
  )
}

const wagmiConfig = getDefaultConfig({
  appName: 'SentinelX',
  projectId: walletConnectId,
  chains: [somniaShannon],
  ssr: true
})

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const status = useAuthStatus()

  const authAdapter = useMemo(
    () =>
      createAuthenticationAdapter({
        getNonce: async () => {
          const res = await fetch('/api/auth/nonce', { cache: 'no-store' })
          return await res.text()
        },
        createMessage: ({ nonce, address, chainId }) =>
          new SiweMessage({
            domain: window.location.host,
            address,
            statement: 'Sign in to SentinelX.',
            uri: window.location.origin,
            version: '1',
            chainId,
            nonce
          }),
        getMessageBody: ({ message }) =>
          message instanceof SiweMessage
            ? message.prepareMessage()
            : new SiweMessage(message).prepareMessage(),
        verify: async ({ message, signature }) => {
          const res = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, signature })
          })
          return res.ok
        },
        signOut: async () => {
          await fetch('/api/auth/logout', { method: 'POST' })
        }
      }),
    []
  )

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitAuthenticationProvider adapter={authAdapter} status={status}>
          <RainbowKitProvider modalSize='compact'>
            {children}
          </RainbowKitProvider>
        </RainbowKitAuthenticationProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
