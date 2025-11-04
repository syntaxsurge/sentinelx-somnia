'use client'

import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig
} from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@rainbow-me/rainbowkit/styles.css'
import { WagmiProvider, http } from 'wagmi'

import { somniaShannon } from '@/lib/chains'

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
  transports: {
    [somniaShannon.id]: http('https://dream-rpc.somnia.network')
  },
  ssr: true
})

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
