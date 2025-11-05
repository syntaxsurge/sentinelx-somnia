'use client'

import { useEffect, useMemo } from 'react'

import {
  RainbowKitAuthenticationProvider,
  RainbowKitProvider,
  createAuthenticationAdapter,
  getDefaultConfig
} from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SiweMessage } from 'siwe'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { injected, coinbaseWallet } from 'wagmi/connectors'

import { useAuthStatus } from '@/hooks/useSession'
import { somniaShannon } from '@/lib/chain'

if (typeof window === 'undefined') {
  import('fake-indexeddb/auto').catch(() => {
    // IndexedDB polyfill unavailable; wagmi will fall back to in-memory storage.
  })
}

const queryClient = new QueryClient()

const walletConnectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID

// If a proper WalletConnect Cloud projectId is configured, use RainbowKit defaults (includes WC).
// Otherwise, avoid initializing WalletConnect entirely to prevent relay WS failures from blocking auth.
const wagmiConfig = walletConnectId && walletConnectId.length > 0
  ? getDefaultConfig({
      appName: 'SentinelX',
      projectId: walletConnectId,
      chains: [somniaShannon],
      ssr: true
    })
  : createConfig({
      chains: [somniaShannon],
      ssr: true,
      transports: { [somniaShannon.id]: http() },
      connectors: [
        injected(),
        coinbaseWallet({ appName: 'SentinelX' })
      ]
    })

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const status = useAuthStatus()

  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      const message =
        typeof reason === 'string'
          ? reason
          : reason?.message ?? reason?.toString?.() ?? ''

      if (message.includes('relay.walletconnect.com')) {
        console.warn(
          'WalletConnect relay is unreachable. WalletConnect connections will be disabled until the relay is available.'
        )
        event.preventDefault()
      }
    }

    window.addEventListener('unhandledrejection', handler)
    return () => window.removeEventListener('unhandledrejection', handler)
  }, [])

  const authAdapter = useMemo(
    () =>
      createAuthenticationAdapter({
        getNonce: async () => {
          const res = await fetch('/api/auth/nonce', {
            cache: 'no-store',
            credentials: 'include'
          })
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
            credentials: 'include',
            body: JSON.stringify({ message, signature })
          })
          return res.ok
        },
        signOut: async () => {
          await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
        }
      }),
    []
  )

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitAuthenticationProvider adapter={authAdapter} status={status}>
          <RainbowKitProvider modalSize='compact'>{children}</RainbowKitProvider>
        </RainbowKitAuthenticationProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
